'use strict'

require('dotenv').config()

const express = require('express')
const piping = require('piping')
const path = require('path')
const morgan = require('morgan')
const busboy = require('express-busboy')
const partials = require('express-partials')
const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')
const uuidV4 = require('uuid/v4')
const expressValidator = require('express-validator')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const CustomStrategy = require('passport-custom').Strategy
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const breadcrumbs = require('express-breadcrumbs')
const cors = require('cors')
const flash = require('connect-flash')
const helmet = require('helmet')
const config = require('./config')
const devWhitelist = require('./whitelist-dev')
const azure = require('./azure')
/**
 * Logging
 * use LogDNA transport for winston if configuration setting available
 */
const winston = require('winston')
if (config.Logging.LogDna.key) {
  require('logdna')
  const options = config.Logging.LogDna
  // Defaults to false, when true ensures meta object will be searchable
  options.index_meta = true
  // Only add this line in order to track exceptions
  options.handleExceptions = true
  winston.add(winston.transports.Logdna, options)
  winston.info(`logdna transport enabled for ${options.hostname}`)
}

if (process.env.NODE_ENV !== 'production') {
  winston.level = 'debug'
}

azure.startInsightsIfConfigured()

const unsetVars = []
Object.keys(config).map((key) => {
  if (config[key] === undefined && !devWhitelist.includes(key)) {
    unsetVars.push(`${key}`)
  }
})

if (unsetVars.length > 0) {
  const error = `The following environment variables need to be defined:\n${unsetVars.join('\n')}`
  process.exitCode = 1
  throw new Error(error)
}

mongoose.promise = global.Promise

if (process.env.NODE_ENV !== 'production') {
  mongoose.set('debug', true)
}

const connectionString = config.MONGO_CONNECTION_STRING
mongoose.connect(connectionString, {
  keepAlive: true,
  reconnectTries: 120,
  // set the delay between every retry (milliseconds)
  reconnectInterval: 1000,
  useMongoClient: true
})

autoIncrement.initialize(mongoose.connection)

const index = require('./routes/index')
const testDeveloper = require('./routes/test-developer')
const serviceManager = require('./routes/service-manager')
const admin = require('./routes/admin')
const questions = require('./routes/questions')
const pupilFeedback = require('./routes/pupil-feedback')
const checkStarted = require('./routes/check-started')
const completedCheck = require('./routes/completed-check')
const pupilPin = require('./routes/pupil-pin')
const restart = require('./routes/restart')

if (process.env.NODE_ENV === 'development') piping({ignore: [/test/, '/coverage/']})
const app = express()

/**
 * Express logging to winston
 */
const expressWinston = require('express-winston')
app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    })
  ],
  meta: true, // optional: control whether you want to log the meta data about the request (default to true)
  // msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
  expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
  colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
  ignoreRoute: function (req, res) {
    return false
  } // optional: allows to skip some log messages based on request and/or response
}))

/* Security Directives */

app.use(cors())
app.use(helmet())
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.google-analytics.com'],
    fontSrc: ["'self'", 'data:'],
    styleSrc: ["'self'"],
    imgSrc: ["'self'", 'https://www.google-analytics.com', 'data:'],
    connectSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'none'"],
    childSrc: ["'none'"]
  }
}))

// Sets request header "Strict-Transport-Security: max-age=31536000; includeSubDomains".
var oneYearInSeconds = 31536000
app.use(helmet.hsts({
  maxAge: oneYearInSeconds,
  includeSubDomains: false,
  preload: false
}))

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

require('./helpers')(app)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

app.use(partials())
// app.use(morgan('dev'))
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

const allowedPath = (url) => (/^\/school\/pupil\/add-batch-pupils$/).test(url) ||
  (/^\/test-developer\/upload-new-form$/).test(url)

const mongoStoreOptions = {
  mongooseConnection: mongoose.connection,
  collection: 'adminsessions'
}
const sessionOptions = {
  name: 'staff-app.sid',
  secret: config.SESSION_SECRET,
  resave: false,
  rolling: true,
  saveUninitialized: false,
  cookie: {maxAge: 1200000}, // Expire after 20 minutes inactivity
  store: new MongoStore(mongoStoreOptions)
}
app.use(session(sessionOptions))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(expressValidator())
app.use(express.static(path.join(__dirname, 'public')))

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
if (process.env.NODE_ENV === 'production') {
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

app.use('/', index)
app.use('/test-developer', testDeveloper)
app.use('/service-manager', serviceManager)
app.use('/school', admin)
app.use('/pupil-pin', pupilPin)
app.use('/restart', restart)
app.use('/api/questions', questions)
app.use('/api/pupil-feedback', pupilFeedback)
app.use('/api/completed-check', completedCheck)
app.use('/api/check-started', checkStarted)

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
  // TODO change this to a real logger with an error string that contains
  // all pertinent information. Assume 2nd/3rd line support would pick this
  // up from logging web interface (e.g. ELK / LogDNA)
  winston.error('ERROR: ' + err.message + ' ID:' + errorId)
  winston.error(err.stack)

  // render the error page
  // TODO provide an error code and phone number? for the user to call support
  res.locals.message = 'An error occurred'
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  res.locals.errorId = errorId
  res.locals.errorCode = ''
  res.status(err.status || 500)
  res.locals.pageTitle = 'Error'
  res.render('error')
})

module.exports = app
