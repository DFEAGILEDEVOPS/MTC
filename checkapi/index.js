'use strict'

const express = require('express')
const dotenv = require('dotenv')
const compression = require('compression')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const errorHandler = require('errorhandler')
const { completeCheck } = require('./controllers/completeCheck')
const { auth } = require('./controllers/auth')
const mongoose = require('mongoose')

dotenv.config()

mongoose.promise = global.Promise
const connectionString = process.env.MONGO_CONNECTION_STRING
mongoose.connect(connectionString, function (err) {
  if (err) {
    throw new Error('Could not connect to mongodb: ' + err.message)
  }
})

const app = express()

// configure express defaults
app.set('port', process.env.PORT || 3003)
app.use(compression())
app.use(morgan('dev'))
app.use(bodyParser.json())
app.disable('x-powered-by')
app.use(helmet())
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'none'"]
  }
}))

// routes
app.post('/complete-check', completeCheck)
app.post('/auth', auth)
app.get('/', function (req, res) {
  // TODO implement values during build, and change route to '/ping'
  res.header('content-type', 'application/json')
  res.send({
    'Build': 'YYYYMMDD.x',
    'Commit': 'Git.Commit.Hash',
    'CurrentServerTime': new Date().toTimeString()
  })
})

if (process.env.NODE_ENV === 'development') {
  app.use(errorHandler())
}

app.listen(app.get('port'), () => {
  console.log(('  App is running at http://localhost:%d in %s mode'), app.get('port'), app.get('env'))
  console.log('  Press CTRL-C to stop\n')
})

module.exports = app
