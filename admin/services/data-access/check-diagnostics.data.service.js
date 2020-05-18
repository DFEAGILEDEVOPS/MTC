'use strict'

const sqlService = require('./sql.service')
const TYPES = sqlService.TYPES
const R = require('ramda')

const service = {
  getByCheckCode: async function getByCheckCode (checkCode) {
    return R.head([])
  }
}

module.exports = service
