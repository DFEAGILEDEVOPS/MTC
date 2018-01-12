'use strict'

const ValidationError = require('../validation-error')
const errorConverter = require('../error-converter')
const checkWindowErrorMessages = require('../errors/check-window')
const XRegExp = require('xregexp')
const moment = require('moment')
const currentYear = moment.utc(moment.now()).format('YYYY')

let checkWindowValidationSchema = {
  'checkWindowName': {
    notEmpty: true,
    errorMessage: checkWindowErrorMessages.checkWindowName,
    isLength: {
      options: [{min: 2, max: 35}],
      errorMessage: checkWindowErrorMessages.checkWindowNameLength
    }
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
      options: [{min: currentYear, max: (currentYear * 1 + 10)}],
      errorMessage: checkWindowErrorMessages.checkEndYearWrongDay
    },
    isLength: {
      options: [{min: 4, max: 4}],
      errorMessage: checkWindowErrorMessages.enterValidYear
    },
    matches: {
      options: [XRegExp('^[0-9]+$')],
      errorMessage: checkWindowErrorMessages.checkEndYearInvalidChars
    },
    notEmpty: true,
    errorMessage: checkWindowErrorMessages.checkEndYearRequired
  }
}

const checkWindowValidationSchemaAdminDate = {
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
    isLength: {
      options: [{min: 4, max: 4}],
      errorMessage: checkWindowErrorMessages.enterValidYear
    },
    notEmpty: true,
    errorMessage: checkWindowErrorMessages.adminStartYearRequired
  }
}

const checkWindowValidationSchemaCheckStart = {
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
    isLength: {
      options: [{min: 4, max: 4}],
      errorMessage: checkWindowErrorMessages.enterValidYear
    },
    matches: {
      options: [XRegExp('^[0-9]+$')],
      errorMessage: checkWindowErrorMessages.checkStartYearInvalidChars
    },
    notEmpty: true,
    errorMessage: checkWindowErrorMessages.checkStartYearRequired
  }
}

module.exports.validate = function (req) {
  return new Promise(async function (resolve, reject) {
    let validationError = new ValidationError()
    let adminStartDate
    let checkStartDate
    let checkEndDate
    const currentDate = moment.utc(moment.now()).format('YYYY-MM-D')

    if (req.body['adminStartDay'] && req.body['adminStartMonth'] && req.body['adminStartYear']) {
      adminStartDate = moment.utc(
        req.body['adminStartYear'] + '-' +
        (req.body['adminStartMonth'].padStart(2, '0')) + '-' +
        (req.body['adminStartDay']).padStart(2, '0'))
    }
    if (req.body['checkStartDay'] && req.body['checkStartMonth'] && req.body['checkStartYear']) {
      checkStartDate = moment.utc(
        req.body['checkStartYear'] + '-' +
        (req.body['checkStartMonth'].padStart(2, '0')) + '-' +
        (req.body['checkStartDay'].padStart(2, '0')))
    }
    if (req.body['checkEndDay'] && req.body['checkEndMonth'] && req.body['checkEndYear']) {
      checkEndDate = moment.utc(
        req.body['checkEndYear'] + '-' +
        (req.body['checkEndMonth'].padStart(2, '0')) + '-' +
        (req.body['checkEndDay'].padStart(2, '0')))
    }
    try {
      if (!req.body.checkWindowId) { // Adding
        checkWindowValidationSchema = Object.assign(
          checkWindowValidationSchema,
          checkWindowValidationSchemaAdminDate,
          checkWindowValidationSchemaCheckStart
        )
        req.checkBody(checkWindowValidationSchema)
        const result = await req.getValidationResult()
        validationError = errorConverter.fromExpressValidator(result.mapped())

        if (adminStartDate !== undefined && adminStartDate.isValid() === false) {
          validationError.addError('adminDateInvalid', true)
        }
        if (checkStartDate !== undefined && checkStartDate.isValid() === false) {
          validationError.addError('checkStartDateInvalid', true)
        }
        if (req.body['checkEndDay'] && req.body['checkEndMonth'] && req.body['checkEndYear'] && checkEndDate.isValid() === false) {
          validationError.addError('checkEndDateInvalid', true)
        }
        if (moment(currentDate).isAfter(adminStartDate)) {
          validationError.addError('adminDateInThePast', true)
        }
        if (adminStartDate && checkStartDate && moment(adminStartDate).isAfter(checkStartDate)) {
          validationError.addError('checkDateBeforeAdminDate', true)
        }
        if (checkStartDate && checkEndDate && moment(checkStartDate).isAfter(checkEndDate)) {
          validationError.addError('checkStartDateAfterEndDate', true)
        }
        if (checkStartDate && moment(currentDate).isAfter(checkStartDate)) {
          validationError.addError('checkStartDateInThePast', true)
        }
        if (checkEndDate && moment(currentDate).isAfter(checkEndDate)) {
          validationError.addError('checkEndDateInThePast', moment(currentDate).isAfter(checkEndDate))
        }
      } else { // Editing
        if (adminStartDate !== undefined) {
          checkWindowValidationSchema = Object.assign(
            checkWindowValidationSchema,
            checkWindowValidationSchemaAdminDate
          )
        }

        if (checkStartDate !== undefined) {
          checkWindowValidationSchema = Object.assign(
            checkWindowValidationSchema,
            checkWindowValidationSchemaCheckStart
          )
        }

        req.checkBody(checkWindowValidationSchema)
        const result = await req.getValidationResult()
        validationError = errorConverter.fromExpressValidator(result.mapped())

        if (adminStartDate !== undefined) {
          if (adminStartDate.isValid() === false) {
            validationError.addError('adminDateInvalid', true)
          }
          if (moment(currentDate).isAfter(adminStartDate)) {
            validationError.addError('adminDateInThePast', moment(currentDate).isAfter(adminStartDate))
          }
        }

        if (checkStartDate !== undefined) {
          if (checkStartDate.isValid() === false) {
            validationError.addError('checkStartDateInvalid', true)
          }
          adminStartDate = adminStartDate || req.body['existingAdminStartDate']
          if (moment(adminStartDate).isAfter(checkStartDate)) {
            validationError.addError('checkDateBeforeAdminDate', true)
          }
          if (moment(checkStartDate).isAfter(checkEndDate)) {
            validationError.addError('checkStartDateAfterEndDate', true)
          }
          if (moment(currentDate).isAfter(checkStartDate)) {
            validationError.addError('checkStartDateInThePast', true)
          }
        }
        if (checkEndDate !== undefined && checkEndDate.isValid() === false) {
          validationError.addError('checkEndDateInvalid', true)
        }
      }

      if (checkEndDate !== undefined) {
        checkStartDate = checkStartDate || req.body['existingCheckStartDate']
        if (moment(checkEndDate).isBefore(checkStartDate)) {
          validationError.addError('checkEndDateBeforeStartDate', true)
        }
        if (moment(currentDate).isAfter(checkEndDate)) {
          validationError.addError('checkEndDateInThePast', true)
        }
      }
    } catch (error) {
      return reject(error)
    }
    resolve(validationError)
  })
}
