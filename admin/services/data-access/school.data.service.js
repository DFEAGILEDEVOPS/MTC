'use strict'

const School = require('../../models/school')

const schoolDataService = {}

schoolDataService.findOne = async function (options) {
  const s = await School.findOne(options).lean().exec()
  return s
}



module.exports = schoolDataService
