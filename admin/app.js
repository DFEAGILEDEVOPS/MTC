'use strict'

if (process.env.NODE_ENV === 'production') {
  require('newrelic')
}

const express = require('express')
const piping = require('piping')
const path = require('path')
// const favicon = require('serve-favicon')
const logger = require('morgan')
// const cookieParser = require('cookie-parser')
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

const fs = require('fs')
const config = require('./config')
const devWhitelist = require('./whitelist-dev')

const unsetVars = []
Object.keys(config).map((key) => {
  if (!config[key] && !devWhitelist.includes(key)) {
    unsetVars.push(`${key}`)
  }
})

if (unsetVars.length > 0) {
  const error = `The following environment variables need to be defined:\n${unsetVars.join('\n')}`
  process.exitCode = 1
  throw new Error(error)
}

mongoose.promise = global.Promise
const connectionString = config.MONGO_CONNECTION_STRING
mongoose.connect(connectionString, function (err) {
  if (err) {
    throw new Error('Could not connect to mongodb: ' + err.message)
  }
})
autoIncrement.initialize(mongoose.connection)

const index = require('./routes/index')
const testDeveloper = require('./routes/test-developer')
const administrator = require('./routes/administrator')
const admin = require('./routes/admin')
const questions = require('./routes/questions')
const pupilFeedback = require('./routes/pupil-feedback')
const completedCheck = require('./routes/completed-check')

if (process.env.NODE_ENV === 'development') piping({ ignore: [/newrelic_agent.log/, /test/] })
const app = express()
app.use(cors())

require('./helpers')(app)

/* for Azure Linux App Service only
logging is not yet correctly implemented, so this is a temporary workaround
 see: https://stackoverflow.com/questions/44419932/capturing-stdout-in-azure-linux-app-service-via-nodejs
 */
if (config.STD_LOG_FILE) {
  const appLog = fs.createWriteStream(config.STD_LOG_FILE)
  process.stdout.write = process.stderr.write = appLog.write.bind(appLog)
  process.on('uncaughtException', function (err) {
    console.error((err && err.stack) || err)
  })
}

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(partials())
app.use(logger('dev'))
busboy.extend(app, {
  upload: true,
  path: 'data/files',
  allowedPath: /^\/test-developer\/manage-check-forms$/,
  mimeTypeLimit: [
    'text/csv'
  ]
})

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
  cookie: { maxAge: 1200000 }, // Expire after 20 minutes inactivity
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

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`)
  } else {
    next()
  }
})

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

app.use(function (req, res, next) {
  res.removeHeader('X-Powered-By')
  next()
})

app.use('/', index)
app.use('/test-developer', testDeveloper)
app.use('/administrator', administrator)
app.use('/school', admin)
app.use('/api/questions', questions)
app.use('/api/pupil-feedback', pupilFeedback)
app.use('/api/completed-check', completedCheck)

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
  console.error('ERROR: ' + err.message + ' ID:' + errorId)
  console.error(err.stack)

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
