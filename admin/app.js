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
console.info(`Admin-app started at ${(new Date()).toISOString()}`)

// non priority modules...
const breadcrumbs = require('express-breadcrumbs')
const busboy = require('express-busboy')
const config = require('./config')
const csurf = require('expressjs-csurf')
const express = require('express')
const featureToggles = require('feature-toggles')
const flash = require('connect-flash')
const LocalStrategy = require('passport-local').Strategy
const partials = require('express-partials')
const passport = require('passport')
const session = require('express-session')
const setupBrowserSecurity = require('./helpers/browserSecurity')
const setupLogging = require('./helpers/logger')
const preventDuplicateFormSubmission = require('./helpers/prevent-duplicate-submit')
const { v4: uuidv4 } = require('uuid')
const authModes = require('./lib/consts/auth-modes')
const dfeSignInStrategy = require('./authentication/dfe-signin-strategy')
const redisCacheService = require('./services/data-access/redis-cache.service')
const { CheckWindowPhaseService } = require('./services/check-window-phase/check-window-phase.service')
const checkWindowPhaseConsts = require('./lib/consts/check-window-phase')
const userInitErrorConsts = require('./lib/errors/user')
const administrationMessageService = require('./services/administration-message.service')

const logger = require('./services/log.service').getLogger()
const sqlService = require('./services/data-access/sql.service')
const { formAlreadySubmittedErrorCode } = require('./error-types/form-already-submitted-error')
const { dfeSignInErrorConsts } = require('./error-types/dfe-signin-error')
const RedisStore = require('connect-redis').default

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
logger.info('NODE_ENV is ' + process.env.NODE_ENV)
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
const hdf = require('./routes/hdf')
const accessArrangements = require('./routes/access-arrangements')
const checkWindow = require('./routes/check-window')
const results = require('./routes/results')
const pupilStatus = require('./routes/pupil-status')
const websiteOffline = require('./routes/website-offline')
const techSupport = require('./routes/tech-support')
const roles = require('./lib/consts/roles')

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
  path: path.join(__dirname, 'data', 'files'),
  allowedPath: (url) => allowedPath(url),
  mimeTypeLimit: [
    'text/csv', // correct
    'text/plain', // IE8 sends this for csv
    'application/octet-stream', // Google Chrome can send this for csv
    'application/vnd.ms-excel' // Windows with Office installed sends this for csv
  ]
})

const allowedPath = (url) =>
  (/^\/pupil-register\/pupil\/add-batch-pupils$/).test(url) ||
  (/^\/test-developer\/upload-new-form$/).test(url) ||
  (/^\/test-developer\/upload$/).test(url) ||
  (/^\/service-manager\/upload-pupil-census\/upload$/).test(url) ||
  (/^\/service-manager\/organisations\/upload$/).test(url)

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

const redisClient = redisCacheService.getRedisClient() // ioredis
redisClient.on('error', function (error) { logger.error(error.message, error) })

if (!config.Redis.useTLS) {
  logger.warn('redis running in non-secure mode')
}

const sessionStore = new RedisStore({ client: redisClient })

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
// Commented out 2021-09-23 as this has never been used.
// if (config.AZURE_STORAGE_CONNECTION_STRING) {
//   app.use(require('./lib/azure-upload'))
// }

app.use(function (req, res, next) {
  // make the user and isAuthenticated vars available in the view templates
  // @ts-ignore
  if (req.isAuthenticated()) {
    res.locals.isAuthenticated = true
    // @ts-ignore
    res.locals.user = req.user
  } else {
    res.locals.isAuthenticated = false
    res.locals.user = null
  }
  next()
})

app.use(function (req, res, next) {
  // make the flash messages available in the locals for use in view templates
  // Calling req.flash() seemingly makes a change to the session, which forces a write to the backend data-store,
  // putting extra pressure on it needlessly.  The work-around here is to only enable flash messages if the user is
  // logged in.  This works in this case, as the site has almost no user scenarios for unauthenticated users.
  if (req.isAuthenticated()) {
    res.locals.messages = req.flash()
  }
  next()
})

app.use(async function (req, res, next) {
  // set up the current check window phase
  // do this for every request
  // @ts-ignore - var declared in server.js
  global.checkWindowPhase = await CheckWindowPhaseService.getPhase()
  logger.info(`CheckWindow Phase is ${global.checkWindowPhase}`)
  next()
})

app.use(async function (req, res, next) {
  // fetch system messages so they can be shown to the users.
  // do this for every request.
  try {
    const serviceMessages = await administrationMessageService.getFilteredMessagesForRequest(req.path)
    res.locals.serviceMessages = serviceMessages
  } catch (error) {
    logger.error('Error setting the serviceMessages: ' + error.message)
  }
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
  // only initialise csrf if the user is logged-in to prevent useless sessions being generated in the session
  // data-store.
  if (!req.isAuthenticated()) { return next() }
  if (csrfExcludedPaths.includes(req.url)) { return next() }
  csrf(req, res, next)
})
app.use((req, res, next) => {
  // only initialise csrf if the user is logged-in to prevent useless sessions being generated in the session
  // data-store.
  if (!req.isAuthenticated()) { return next() }
  if (!csrfExcludedPaths.includes(req.url)) { res.locals.csrftoken = req.csrfToken() }
  next()
})

// Prevent forms being submitted more than once
app.use(preventDuplicateFormSubmission)

// Makes the session expiry time available in the res object so we can insert it into the html, so javascript can
// access it: used by the session expiry modal.
app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.sessionExpiresAt = +Date.now() + (config.ADMIN_SESSION_EXPIRATION_TIME_IN_SECONDS * 1000)
  }
  next()
})

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
  app.use('/attendance', hdf)
  app.use('/access-arrangements', accessArrangements)
  app.use('/check-window', checkWindow)
  app.use('/results', results)
  app.use('/pupil-status', pupilStatus)
  app.use('/tech-support', techSupport)
}

app.use(async function (req, res, next) {
  try {
    if (req.isAuthenticated() === false) return next()
    if (!req.user) {
      return next()
    }
    // if user is a teacher and system is unavailable, short circuit to the unavailable page
    if (global.checkWindowPhase === checkWindowPhaseConsts.unavailable && req.user.role === roles.teacher) {
      res.locals.pageTitle = 'The service is currently closed'
      return res.render('availability/admin-window-unavailable', {})
    }
    next()
  } catch (error) {
    next(error)
  }
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = { message: 'Page not found', statusCode: 404 }
  next(err)
})

// error handler
app.use(function (err, req, res, next) {
  const errorId = uuidv4()
  res.locals.errorId = errorId

  // set locals, only providing error in development
  logger.error(`ERROR: ${err.message} ID: ${errorId}`, err)

  // catch CSRF errors and redirect to the previous location
  if (err.code === 'EBADCSRFTOKEN') return res.redirect('back')

  // catch system unavailable errors and redirect to the relevant page
  if (err.name === 'SystemUnavailableError' || err.code === 'SYSTEM_UNAVAILABLE') {
    res.locals.pageTitle = 'The service is currently closed'
    return res.render('availability/admin-window-unavailable', {})
  }

  if (err.code === formAlreadySubmittedErrorCode) {
    res.locals.pageTitle = 'Form already submitted'
    return res.render('form-already-submitted', {})
  }

  // catch school not found errors and redirect to the relevant page
  if (err.code === userInitErrorConsts.schoolNotFound) {
    res.locals.pageTitle = 'School not found'
    return res.render('availability/school-not-found', {})
  }

  if (err.statusCode === 404) {
    res.locals.pageTitle = 'Page not found'
    res.status(404)
    return res.render('availability/page-not-found', {})
  }

  if (err.name === 'DfeSignInError') {
    res.locals.pageTitle = 'Something isn\'t quite right!'
    res.status(500)
    console.log('dfeSignInErrorConsts', dfeSignInErrorConsts)
    if (err?.originalError?.code === userInitErrorConsts.schoolNotFound || err?.originalError?.code === dfeSignInErrorConsts.dfeRoleError) {
      return res.render('dfe-sign-in-error-missing-org')
    }
    // Catchall handling for Dfe Sign in errors.
    return res.render('dfe-sign-in-error', { userMessage: err.userMessage ?? '' })
  }

  // render the error page
  res.locals.message = 'An error occurred'
  res.locals.userMessage = err.userMessage
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  res.locals.errorCode = ''
  res.status(err.statusCode || 500)
  res.locals.pageTitle = 'Error'
  res.render('error')
})

module.exports = app
