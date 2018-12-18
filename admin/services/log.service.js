'use strict'

const Logger = require('../models/logger')
const logger = new Logger()

function getLogger() { return logger }

module.exports = { getLogger }
