'use strict'

const ValidationError = require('../validation-error')
const errorConverter = require('../error-converter')
const checkWindowErrorMessages = require('../errors/check-window')
const XRegExp = require('xregexp')
const moment = require('moment')
const currentYear = moment.utc(Date.now()).format('YYYY')

const checkWindowValidationSchema = {
  'checkWindowName': {
    notEmpty: true,
    errorMessage: checkWindowErrorMessages.checkWindowName
  },
  'adminStartDay': {
    isInt: {
      options: [{min: 1, max: 31}],
      errorMessage: checkWindowErrorMessages.adminStartDayWrongDay
    },
    matches: {
      options: [XRegExp('^[0-9]+$')],
      errorMessage: checkWindowErrorMessages.adminStartDayInvalidChars
    },
    notEmpty: true,
    errorMessage: checkWindowErrorMessages.adminStartDayRequired
  },
  'adminStartMonth': {
    isInt: {
      options: [{min: 1, max: 12}],
      errorMessage: checkWindowErrorMessages.adminStartMonthWrongDay
    },
    matches: {
      options: [XRegExp('^[0-9]+$')],
      errorMessage: checkWindowErrorMessages.adminStartMonthInvalidChars
    },
    notEmpty: true,
    errorMessage: checkWindowErrorMessages.adminStartMonthRequired
  },
  'adminStartYear': {
    isInt: {
      options: [{min: currentYear}],
      errorMessage: checkWindowErrorMessages.adminStartYearWrongDay
    },
    matches: {
      options: [XRegExp('^[0-9]+$')],
      errorMessage: checkWindowErrorMessages.adminStartYearInvalidChars
    },
    notEmpty: true,
    errorMessage: checkWindowErrorMessages.adminStartYearRequired
  },
  'checkStartDay': {
    isInt: {
      options: [{min: 1, max: 31}],
      errorMessage: checkWindowErrorMessages.checkStartDayWrongDay
    },
    matches: {
      options: [XRegExp('^[0-9]+$')],
      errorMessage: checkWindowErrorMessages.checkStartDayInvalidChars
    },
    notEmpty: true,
    errorMessage: checkWindowErrorMessages.checkStartDayRequired
  },
  'checkStartMonth': {
    isInt: {
      options: [{min: 1, max: 12}],
      errorMessage: checkWindowErrorMessages.checkStartMonthWrongDay
    },
    matches: {
      options: [XRegExp('^[0-9]+$')],
      errorMessage: checkWindowErrorMessages.checkStartMonthInvalidChars
    },
    notEmpty: true,
    errorMessage: checkWindowErrorMessages.checkStartMonthRequired
  },
  'checkStartYear': {
    isInt: {
      options: [{min: currentYear}],
      errorMessage: checkWindowErrorMessages.checkStartYearWrongDay
    },
    matches: {
      options: [XRegExp('^[0-9]+$')],
      errorMessage: checkWindowErrorMessages.checkStartYearInvalidChars
    },
    notEmpty: true,
    errorMessage: checkWindowErrorMessages.checkStartYearRequired
  },
  'checkEndDay': {
    isInt: {
      options: [{min: 1, max: 31}],
      errorMessage: checkWindowErrorMessages.checkEndDayWrongDay
    },
    matches: {
      options: [XRegExp('^[0-9]+$')],
      errorMessage: checkWindowErrorMessages.checkEndDayInvalidChars
    },
    notEmpty: true,
    errorMessage: checkWindowErrorMessages.checkEndDayRequired
  },
  'checkEndMonth': {
    isInt: {
      options: [{min: 1, max: 12}],
      errorMessage: checkWindowErrorMessages.checkEndMonthWrongDay
    },
    matches: {
      options: [XRegExp('^[0-9]+$')],
      errorMessage: checkWindowErrorMessages.checkEndMonthInvalidChars
    },
    notEmpty: true,
    errorMessage: checkWindowErrorMessages.checkEndMonthRequired
  },
  'checkEndYear': {
    isInt: {
      options: [{min: currentYear}],
      errorMessage: checkWindowErrorMessages.checkEndYearWrongDay
    },
    matches: {
      options: [XRegExp('^[0-9]+$')],
      errorMessage: checkWindowErrorMessages.checkEndYearInvalidChars
    },
    notEmpty: true,
    errorMessage: checkWindowErrorMessages.checkEndYearRequired
  }
}

module.exports.validate = function (req) {
  return new Promise(async function (resolve, reject) {
    let validationError = new ValidationError()
    try {
      req.checkBody(checkWindowValidationSchema)
      const result = await req.getValidationResult()
      validationError = errorConverter.fromExpressValidator(result.mapped())
    } catch (error) {
      return reject(error)
    }
    resolve(validationError)
  })
}
