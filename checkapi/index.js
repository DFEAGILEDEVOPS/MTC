'use strict'

require('dotenv').config()
const appInsights = require('applicationinsights')
const express = require('express')
const compression = require('compression')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const errorHandler = require('errorhandler')
// controllers
const ping = require('./controllers/ping')
const { completeCheck } = require('./controllers/complete-check')
const { auth } = require('./controllers/auth')
const storageService = require('./services/data-access/storage.service')
const config = require('./config')

// initialise monitoring
if (config.APPINSIGHTS_INSTRUMENTATIONKEY) {
  appInsights.setup()
  appInsights.start()
}

storageService.init()

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

app.use(express.static('public'))
// routes
app.post('/complete-check', completeCheck)
app.post('/auth', auth)
app.get('/ping', ping.get)

if (process.env.NODE_ENV === 'development') {
  app.use(errorHandler())
}

app.listen(app.get('port'), () => {
  console.log(('  App is running at http://localhost:%d in %s mode'), app.get('port'), app.get('env'))
  console.log('  Press CTRL-C to stop\n')
})

module.exports = app
