'use strict'

// these modules must be loaded first
require('dotenv').config()
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
const path = require('path')
const partials = require('express-partials')
const passport = require('passport')
const R = require('ramda')
const session = require('express-session')
const setupBrowserSecurity = require('./helpers/browserSecurity')
const setupLogging = require('./helpers/logger')
const preventDuplicateFormSubmission = require('./helpers/prevent-duplicate-submit')
const uuidV4 = require('uuid/v4')

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

// Initialise the Database Connection pool
;(async function () {
  try {
    logger.debug('Attempting to initialise the connection pool')
    await sqlService.initPool()
  } catch (error) {
    logger.alert('Failed to connect to the database', error)
    // The initial probe connection was not able to connect: the DB is not available.  This will cause all
    // connections in the connection pool to be initialised to closed. By pausing, we allow time for the
    // db to become available.  When run in a docker container the PM2 process manager will restart the process, and
    // hopefully the DB will be up by then.
    await sqlService.drainPool()
    logger.alert(`Waiting for ${config.WaitTimeBeforeExitInSeconds} seconds before terminating.`)
    await sleep(config.WaitTimeBeforeExitInSeconds * 1000)
    process.exit(1)
  }
})()

/**
 * Load feature toggles
 */
logger.info('ENVIRONMENT_NAME : ' + config.Environment)
const environmentName = config.Environment
let featureTogglesSpecific, featureTogglesDefault, featureTogglesMerged
let featureTogglesSpecificPath, featureTogglesDefaultPath
try {
  featureTogglesSpecificPath = './config/feature-toggles.' + environmentName
  featureTogglesSpecific = environmentName ? require(featureTogglesSpecificPath) : null
} catch (err) {}

try {
  featureTogglesDefaultPath = './config/feature-toggles.default'
  featureTogglesDefault = require(featureTogglesDefaultPath)
} catch (err) {}

featureTogglesMerged = R.mergeRight(featureTogglesDefault, featureTogglesSpecific)

if (featureTogglesMerged) {
  logger.info(`Loading merged feature toggles from '${featureTogglesSpecificPath}', '${featureTogglesDefaultPath}': `, featureTogglesMerged)
  featureToggles.load(featureTogglesMerged)
}

const index = require('./routes/index')
const testDeveloper = require('./routes/test-developer')
const serviceManager = require('./routes/service-manager')
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

// passport with custom strategy
passport.use(new CustomStrategy(
  require('./authentication/nca-tools-authentication-strategy')
))

// Passport with local strategy
passport.use(
  new LocalStrategy({
    passReqToCallback: true
  },
  require('./authentication/local-strategy')
  )
)

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
  '/auth', // disable CSRF for NCA tools
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
  let err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use(function (err, req, res, next) {
  let errorId = uuidV4()
  // set locals, only providing error in development
  // @TODO: change this to a real logger with an error string that contains
  // all pertinent information. Assume 2nd/3rd line support would pick this
  // up from logging web interface (e.g. ELK / LogDNA)
  logger.error(`ERROR: ${err.message} ID: ${errorId}`, err)

  // catch CSRF errors and redirect to the previous location
  if (err.code === 'EBADCSRFTOKEN') return res.redirect('back')

  if (err.hasOwnProperty('mtcInfo')) {
    res.locals.mtcInfo = err.mtcInfo
  }

  // render the error page
  // @TODO: provide an error code and phone number? for the user to call support
  res.locals.message = 'An error occurred'
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  res.locals.errorId = errorId
  res.locals.errorCode = ''
  res.status(err.status || 500)
  res.locals.pageTitle = 'Error'
  res.render('error')
})

module.exports = app
