'use strict'

require('dotenv').config()

const express = require('express')
const piping = require('piping')
const path = require('path')
const busboy = require('express-busboy')
const partials = require('express-partials')
const uuidV4 = require('uuid/v4')
const expressValidator = require('express-validator')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const CustomStrategy = require('passport-custom').Strategy
const session = require('express-session')
const TediousSessionStore = require('connect-tedious')(session)
const breadcrumbs = require('express-breadcrumbs')
const flash = require('connect-flash')
const config = require('./config')
const checkConfigWhitelist = require('./helpers/whitelist-dev')
const azure = require('./azure')
const featureToggles = require('feature-toggles')
const winston = require('winston')
const R = require('ramda')
const csurf = require('csurf')
const setupLogging = require('./helpers/logger')
const setupBrowserSecurity = require('./helpers/browserSecurity')

azure.startInsightsIfConfigured()

/**
 * Load feature toggles
 */
winston.info('ENVIRONMENT_NAME : ' + config.Environment)
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

featureTogglesMerged = R.merge(featureTogglesDefault, featureTogglesSpecific)

if (featureTogglesMerged) {
  winston.info(`Loading merged feature toggles from '${featureTogglesSpecificPath}', '${featureTogglesDefaultPath}': `, featureTogglesMerged)
  featureToggles.load(featureTogglesMerged)
}

const index = require('./routes/index')
const testDeveloper = require('./routes/test-developer')
const serviceManager = require('./routes/service-manager')
const school = require('./routes/school')
const questions = require('./routes/questions')
const pupilFeedback = require('./routes/pupil-feedback')
const checkStarted = require('./routes/check-started')
const completedCheck = require('./routes/completed-check')
const pupilPin = require('./routes/pupil-pin')
const restart = require('./routes/restart')
const pupilsNotTakingTheCheck = require('./routes/pupils-not-taking-the-check')
const group = require('./routes/group')
const pupilRegister = require('./routes/pupil-register')
const attendance = require('./routes/attendance')

if (process.env.NODE_ENV === 'development') piping({ignore: [/test/, '/coverage/']})
const app = express()

setupBrowserSecurity(app)
setupLogging(app)
// checkConfigWhitelist(app)

// Use the feature toggle middleware to enable it in res.locals
app.use(featureToggles.middleware)

// azure uses req.headers['x-arr-ssl'] instead of x-forwarded-proto
// if production ensure x-forwarded-proto is https OR x-arr-ssl is present
app.use((req, res, next) => {
  if (azure.isAzure()) {
    app.enable('trust proxy')
    req.headers['x-forwarded-proto'] = req.header('x-arr-ssl') ? 'https' : 'http'
  }
  next()
})

// force HTTPS in azure
app.use((req, res, next) => {
  if (azure.isAzure()) {
    if (req.protocol !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`)
    }
  } else {
    next()
  }
})

/* END:Security Directives */

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
  (/^\/service-manager\/upload-pupil-census\/upload$/).test(url)

// as we run in container over http, we must set up proxy trust for secure cookies
let secureCookie = false
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
  secureCookie = true
}

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
  store: new TediousSessionStore({
    config: {
      appName: config.Sql.Application.Name,
      userName: config.Sql.Application.Username,
      password: config.Sql.Application.Password,
      server: config.Sql.Server,
      options: {
        port: config.Sql.Port,
        database: config.Sql.Database,
        encrypt: true,
        requestTimeout: config.Sql.Timeout
      }
    },
    tableName: '[mtc_admin].[sessions]'
  })
}
app.use(session(sessionOptions))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(expressValidator())
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, path) => {
    // force download all .csv files
    if (path.endsWith('.csv')) {
      res.attachment(path)
    }
  }
}))

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
  new LocalStrategy(
    {passReqToCallback: true},
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

app.use('/api/questions', questions)
app.use('/api/pupil-feedback', pupilFeedback)
app.use('/api/completed-check', completedCheck)
app.use('/api/check-started', checkStarted)

// CSRF setup - needs to be set up after session() and after API calls
// that shouldn't use CSRF; also exclude if url in the csrfExcludedPaths
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
  winston.error('ERROR: ' + err.message + ' ID:' + errorId)
  winston.error(err.stack)

  // catch CSRF errors and redirect to the previous location
  if (err.code === 'EBADCSRFTOKEN') return res.redirect('back')

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
