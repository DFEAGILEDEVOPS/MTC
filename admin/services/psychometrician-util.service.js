'use strict'

const R = require('ramda')
const psUtilService = {}

psUtilService.getSurname = function (completedCheck) {
  return completedCheck.check.pupilId.lastName.substr(0, 35)
}

psUtilService.getForename = function (completedCheck) {
  return completedCheck.check.pupilId.foreName.substr(0, 35)
}

psUtilService.getMiddleNames = function (completedCheck) {
  return R.pathOr('', ['check', 'pupilId', 'middleNames'], completedCheck).substr(0, 35)
}

module.exports = psUtilService
