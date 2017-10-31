'use strict'

const School = require('../../models/school')

const schoolDataService = {}

schoolDataService.findOne = async function (options) {
  const s = await School.findOne(options).exec()
  return s
}

schoolDataService.save = function (school) {
  return school.save()
}

module.exports = schoolDataService
