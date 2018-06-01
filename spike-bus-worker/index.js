'use strict'

require('dotenv').config()

const winston = require('winston')
const listener = require('./listener')

winston.info('starting up bus listener')
listener.listen()
