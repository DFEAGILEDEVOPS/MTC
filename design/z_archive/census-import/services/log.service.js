'use strict'

const Logger = require('../models/logger')

// All logging will be done through this singleton
const logger = new Logger()

function getLogger () { return logger }

module.exports = { getLogger }
