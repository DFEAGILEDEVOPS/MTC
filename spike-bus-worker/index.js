'use strict'

require('dotenv').config()

const listener = require('./listener')

// listener.send('hello from node')
listener.listen()
