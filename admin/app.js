'use strict'

// these modules must be loaded first
const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '.env')

try {
  if (fs.existsSync(globalDotEnvFile)) {
    console.log('globalDotEnvFile found', globalDotEnvFile)
    require('dotenv').config({ path: globalDotEnvFile })
  } else {
    console.log('No .env file found at project root')
  }
} catch (error) {
  console.error(error)
}

// telemetry
// fallback to app insights, if configured
const appInsights = require('./helpers/app-insights')
appInsights.startInsightsIfConfigured()

// non priority modules...
const breadcrumbs = require('express-breadcrumbs')
const busboy = require('express-busboy')
const config = require('./config')
const csurf = require('csurf')
const CustomStrategy = require('passport-custom').Strategy
const express = require('express')
const expressValidator = require('express-validator')
const featureToggles = require('feature-toggles')
const flash = require('connect-flash')
const LocalStrategy = require('passport-local').Strategy
const piping = require('piping')
const partials = require('express-partials')
const passport = require('passport')
const session = require('express-session')
const setupBrowserSecurity = require('./helpers/browserSecurity')
const setupLogging = require('./helpers/logger')
const preventDuplicateFormSubmission = require('./helpers/prevent-duplicate-submit')
const uuidV4 = require('uuid/v4')
const authModes = require('./lib/consts/auth-modes')
const dfeSignInStrategy = require('./authentication/dfe-signin-strategy')

const logger = require('./services/log.service').getLogger()
const sqlService = require('./services/data-access/sql.service')

const app = express()
setupLogging(app)

const { WEBSITE_OFFLINE } = config

/**
 * Sleep in ms
 * @param ms - milliseconds
 * @return {Promise}
 */
function sleep (ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

// Initialise the Read-write Database Connection pool
;(async function () {
  try {
    logger.debug('Attempting to initialise the read-write connection pool')
    await sqlService.initPool()
  } catch (error) {
    logger.alert('Failed to connect to the readwrite database', error)
    // The initial probe connection was not able to connect: the DB is not available.  This will cause all
    // connections in the connection pool to be initialised to closed. By pausing, we allow time for the
    // db to become available.  When run in a docker container the PM2 process manager will restart the process, and
    // hopefully the DB will be up by then.
    await sqlService.drainPool()
    logger.alert(`Waiting for ${config.WaitTimeBeforeExitInSeconds} seconds before terminating readwrite connection.`)
    await sleep(config.WaitTimeBeforeExitInSeconds * 1000)
    process.exit(1)
  }
})()

// Initialise the Read-only Database Connection pool
;(async function () {
  // kill switch...
  if (config.Sql.AllowReadsFromReplica !== true) return
  try {
    logger.debug('Attempting to initialise the read-only connection pool')
    await sqlService.initReadonlyPool()
  } catch (error) {
    logger.alert('Failed to connect to the readonly database', error)
    // The initial probe connection was not able to connect: the DB is not available.  This will cause all
    // connections in the connection pool to be initialised to closed. By pausing, we allow time for the
    // db to become available.  When run in a docker container the PM2 process manager will restart the process, and
    // hopefully the DB will be up by then.
    await sqlService.drainReadonlyPool()
    logger.alert(`Waiting for ${config.WaitTimeBeforeExitInSeconds} seconds before terminating readonly connection.`)
    await sleep(config.WaitTimeBeforeExitInSeconds * 1000)
    process.exit(1)
  }
})()

logger.info('ENVIRONMENT_NAME : ' + config.Environment)
// Load feature toggles
logger.info('Loading feature toggles from: ', config.FeatureToggles)
featureToggles.load(config.FeatureToggles)

const index = require('./routes/index')
const testDeveloper = require('./routes/test-developer')
const serviceManager = require('./routes/service-manager')
const serviceMessage = require('./routes/service-message')
const helpdesk = require('./routes/helpdesk')
const school = require('./routes/school')
const pupilPin = require('./routes/pupil-pin')
const restart = require('./routes/restart')
const pupilsNotTakingTheCheck = require('./routes/pupils-not-taking-the-check')
const group = require('./routes/group')
const pupilRegister = require('./routes/pupil-register')
const attendance = require('./routes/attendance')
const accessArrangements = require('./routes/access-arrangements')
const checkWindow = require('./routes/check-window')
const checkForm = require('./routes/check-form')
const results = require('./routes/results')
const websiteOffline = require('./routes/website-offline')

if (process.env.NODE_ENV === 'development') {
  piping({
    ignore: [/test/, '/coverage/']
  })
}

setupBrowserSecurity(app)

// Use the feature toggle middleware to enable it in res.locals
app.use(featureToggles.middleware)

require('./helpers/index')(app)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

app.use(partials())
busboy.extend(app, {
  upload: true,
  path: 'data/files',
  allowedPath: (url) => allowedPath(url),
  mimeTypeLimit: [
    'text/csv', // correct
    'text/plain', // IE8 sends this for csv
    'application/octet-stream', // Google Chrome can send this for csv
    'application/vnd.ms-excel' // Windows with Office installed sends this for csv
  ]
})

const allowedPath = (url) => (/^\/pupil-register\/pupil\/add-batch-pupils$/).test(url) ||
  (/^\/test-developer\/upload-new-form$/).test(url) ||
  (/^\/service-manager\/upload-pupil-census\/upload$/).test(url) ||
  (/^\/check-form\/upload$/).test(url)

// as we run in container over http, we must set up proxy trust for secure cookies
let secureCookie = false
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
  secureCookie = true
}

// Serve static files
// Set up *before* the session is set-up, or each of these
// causes a session read and write.
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, path) => {
    // force download all .csv files
    if (path.endsWith('.csv')) {
      res.attachment(path)
    }
  }
}))

const RedisStore = require('connect-redis')(session)
const options = {
  host: config.Redis.Host,
  port: config.Redis.Port
}
if (config.Redis.Key) {
  options.auth_pass = config.Redis.Key
}
if (config.Redis.useTLS) {
  options.tls = { servername: config.Redis.Host }
}
const sessionStore = new RedisStore(options)

const sessionOptions = {
  name: 'mtc-admin-session-id',
  secret: config.SESSION_SECRET,
  resave: false,
  rolling: true,
  saveUninitialized: false,
  cookie: {
    maxAge: config.ADMIN_SESSION_EXPIRATION_TIME_IN_SECONDS * 1000,
    httpOnly: true,
    secure: secureCookie
  },
  store: sessionStore
}

app.use(session(sessionOptions))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(expressValidator())

// Breadcrumbs
app.use(breadcrumbs.init())
app.use(breadcrumbs.setHome())

// Initialise Passport
passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (user, done) {
  done(null, user)
})

if (config.Auth.mode === authModes.dfeSignIn) {
  dfeSignInStrategy.initialiseAsync()
    .then((strategy) => {
      passport.use(authModes.dfeSignIn, strategy)
    })
    .catch((error) => {
      logger.error(`unable to configure passport for dfeSignin:${error.message}`)
      process.exit(1)
    })
} else {
  // initialise chosen auth strategy only
  switch (config.Auth.mode) {
    case authModes.ncaTools:
      passport.use(authModes.ncaTools, new CustomStrategy(
        require('./authentication/nca-tools-authentication-strategy')
      ))
      break
    default:
      passport.use(authModes.local,
        new LocalStrategy({
          passReqToCallback: true
        },
        require('./authentication/local-strategy')
        )
      )
      break
  }
}

// Middleware to upload all files uploaded to Azure Blob storage
// Should be configured after busboy
if (config.AZURE_STORAGE_CONNECTION_STRING) {
  app.use(require('./lib/azure-upload'))
}

app.use(function (req, res, next) {
  // make the user and isAuthenticated vars available in the view templates
  if (req.isAuthenticated()) {
    res.locals.isAuthenticated = true
    res.locals.user = req.user
  } else {
    res.locals.isAuthenticated = false
    res.locals.user = null
  }
  next()
})

app.use(function (req, res, next) {
  // make the flash messages available in the locals for use in view templates
  res.locals.messages = req.flash()
  next()
})

// CSRF setup - needs to be set up after session()
// also exclude if url in the csrfExcludedPaths
const csrf = csurf()
const csrfExcludedPaths = [
  '/auth', // disable CSRF for federated auth
  '/sign-in' // disable CSRF for login
]
app.use(function (req, res, next) {
  if (csrfExcludedPaths.includes(req.url)) return next()
  csrf(req, res, next)
})
app.use((req, res, next) => {
  if (!csrfExcludedPaths.includes(req.url)) res.locals.csrftoken = req.csrfToken()
  next()
})

// Prevent forms being submitted more than once
app.use(preventDuplicateFormSubmission)

if (WEBSITE_OFFLINE) {
  app.use('*', websiteOffline)
} else {
  app.use('/', index)
  app.use('/test-developer', testDeveloper)
  app.use('/service-manager', serviceManager)
  app.use('/service-message', serviceMessage)
  app.use('/helpdesk', helpdesk)
  app.use('/school', school)
  app.use('/pupil-pin', pupilPin)
  app.use('/pupils-not-taking-the-check', pupilsNotTakingTheCheck)
  app.use('/group', group)
  app.use('/restart', restart)
  app.use('/pupil-register', pupilRegister)
  app.use('/attendance', attendance)
  app.use('/access-arrangements', accessArrangements)
  app.use('/check-window', checkWindow)
  app.use('/check-form', checkForm)
  app.use('/results', results)
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use(function (err, req, res, next) {
  const errorId = uuidV4()
  // set locals, only providing error in development
  // @TODO: change this to a real logger with an error string that contains
  // all pertinent information. Assume 2nd/3rd line support would pick this
  // up from logging web interface (e.g. ELK / LogDNA)
  logger.error(`ERROR: ${err.message} ID: ${errorId}`, err)

  // catch CSRF errors and redirect to the previous location
  if (err.code === 'EBADCSRFTOKEN') return res.redirect('back')

  // render the error page
  // @TODO: provide an error code and phone number? for the user to call support
  res.locals.message = 'An error occurred'
  res.locals.userMessage = err.userMessage
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  res.locals.errorId = errorId
  res.locals.errorCode = ''
  res.status(err.status || 500)
  res.locals.pageTitle = 'Error'
  res.render('error')
})

module.exports = app
