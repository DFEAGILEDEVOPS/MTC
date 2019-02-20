'use strict'

const sqlService = require('less-tedious')
const { TYPES } = require('tedious')

const config = require('../config')
sqlService.initialise(config)

const v1 = {
  process: async function process (logger) {


    return {
      processCount: 0
    }
  }
}

module.exports = v1
