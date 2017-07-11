require('newrelic')
const bodyParser = require('body-parser')
const compression = require('compression')
const CustomStrategy = require('passport-custom').Strategy
const express = require('express')
const piping = require('piping')
const mongoose = require('mongoose')
// const morgan = require('morgan')
const partials = require('express-partials')
const passport = require('passport')
const path = require('path')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const uuidV4 = require('uuid/v4')
const fs = require('fs')

const index = require('./routes/index')
const mtcCheck = require('./routes/mtc-check')
const mtcWarmUp = require('./routes/mtc-warm-up')
const Pupil = require('./models/pupil')
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

// override Mongoose's default promise library with one from Node.
mongoose.promise = global.Promise

/**
 * @brief override by env var MONGO_CONNECTION_STRING
 * @type {string}
 */
let connectionString = 'mongodb://localhost/mtc'
let sessionOptions
let mongoStoreOptions

if (process.env.NODE_ENV === 'development') piping({ ignore: [/newrelic_agent.log/, /test/] })
const app = express()

const helpers = require('./helpers')(app)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
// if (process.env.NODE_ENV === 'production') {
//   logger = require('./lib/logger')
//   // bunyan logger saving to Azure, warnings and above to stdout as well
//   app.use(function(req, res, next){
//     logger.info( { req: req,  msg: 'Request received' } )
//     req.log = logger
//     next()
//   })
// } else {
//   logger = morgan
//   app.use(morgan('dev'))
// }

// mongoose
if (config.MONGO_CONNECTION_STRING) {
  connectionString = config.MONGO_CONNECTION_STRING
}

mongoose.connect(connectionString, function (err) {
  if (err) {
    console.log('Could not connect to mongodb. Ensure that you have mongodb running on localhost and mongodb accepts ' +
      'connections on standard ports!')
  }
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

mongoStoreOptions = {
  mongooseConnection: mongoose.connection
}

sessionOptions = {
  name: 'pupil-app.sid',
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: new MongoStore(mongoStoreOptions),
  cookie: { maxAge: 600000 }, // Expire after 10 minutes inactivity,
  rolling: true
}

/* for Azure Linux App Service only
logging is not yet correctly implemented, so this is a temporary workaround
 see: https://stackoverflow.com/questions/44419932/capturing-stdout-in-azure-linux-app-service-via-nodejs
 */
if (config.STD_LOG_FILE) {
  const appLog = fs.createWriteStream(config.STD_LOG_FILE)
  process.stdout.write = process.stderr.write = appLog.write.bind(appLog)
  process.on('uncaughtException', function (err) {
    console.error((err && err.stack) ? err.stack : err)
  })
}

app.use(function (req, res, next) {
  res.removeHeader('X-Powered-By')
  next()
})

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`)
  } else {
    next()
  }
})

app.use(session(sessionOptions))
app.use(passport.initialize())
app.use(passport.session())
app.use(compression({filter: shouldCompress}))

// Initialise Passport
passport.serializeUser(function (pupil, done) {
  done(null, pupil._id)
})

passport.deserializeUser(async function (pupilId, done) {
  if (!pupilId) {
    return done(null, false)
  }

  try {
    const pupil = await Pupil
      .findOne({_id: pupilId})
      .populate('school')

    if (!pupil) {
      return done('ERROR finding session record.')
    } else {
      return done(null, pupil)
    }
  } catch (error) {
    console.log('ERROR deserialising session', error)
  }
})

app.use(express.static(path.join(__dirname, 'public'), {
  maxage: '1d',
  setHeaders: function (res, fullpath) {
    'use strict'
    let re = new RegExp('^' + __dirname + '/public')
    let appPath = fullpath.replace(re, '')
    if (appPath.substring(0, 6) === '/data/') {
      res.setHeader('Cache-Control', 'public, max-age=0')
    }
  }}))

// passport with custom strategy
passport.use(new CustomStrategy(
   require('./authentication/passport-custom-5-digits')
))

app.use(partials())
app.use('/', index)
app.use('/check', mtcCheck)
app.use('/warm-up', mtcWarmUp)

function shouldCompress (req, res) {
  'use strict'
  if (req.url.substring(0, 6) === '/data/') {
    // don't compress the files used for the speed test
    return false
  }
  // fallback to standard filter function
  return compression.filter(req, res)
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
  res.render('error', {layout: 'question-layout'})
})

module.exports = app
