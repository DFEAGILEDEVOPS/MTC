'use strict'

const ValidationError = require('../validation-error')
const errorConverter = require('../error-converter')
const checkWindowErrorMessages = require('../errors/check-window')
const XRegExp = require('xregexp')
const moment = require('moment')
const currentYear = moment.utc(moment.now()).format('YYYY')

const getCheckWindowValidationSchemas = () => {
  let checkWindowValidationBasicSchema = {
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
  return {
    checkWindowValidationBasicSchema,
    checkWindowValidationSchemaAdminDate,
    checkWindowValidationSchemaCheckStart
  }
}

module.exports.validate = function (requestData, checkBody, getValidationResult) {
  return new Promise(async function (resolve, reject) {
    const { checkWindowValidationBasicSchema,checkWindowValidationSchemaAdminDate, checkWindowValidationSchemaCheckStart } =
      getCheckWindowValidationSchemas()
    let checkWindowValidationSchema
    let validationError = new ValidationError()
    let adminStartDate
    let checkStartDate
    let checkEndDate
    const currentDate = moment.utc(moment.now()).format('YYYY-MM-D')

    if (requestData['adminStartDay'] && requestData['adminStartMonth'] && requestData['adminStartYear']) {
      adminStartDate = moment.utc(
        requestData['adminStartYear'] + '-' +
        (requestData['adminStartMonth'].padStart(2, '0')) + '-' +
        (requestData['adminStartDay']).padStart(2, '0'))
    }
    if (requestData['checkStartDay'] && requestData['checkStartMonth'] && requestData['checkStartYear']) {
      checkStartDate = moment.utc(
        requestData['checkStartYear'] + '-' +
        (requestData['checkStartMonth'].padStart(2, '0')) + '-' +
        (requestData['checkStartDay'].padStart(2, '0')))
    }
    if (requestData['checkEndDay'] && requestData['checkEndMonth'] && requestData['checkEndYear']) {
      checkEndDate = moment.utc(
        requestData['checkEndYear'] + '-' +
        (requestData['checkEndMonth'].padStart(2, '0')) + '-' +
        (requestData['checkEndDay'].padStart(2, '0')))
    }
    try {
      if (!requestData.checkWindowId) { // Adding
        checkWindowValidationSchema = Object.assign(
          checkWindowValidationBasicSchema,
          checkWindowValidationSchemaAdminDate,
          checkWindowValidationSchemaCheckStart
        )
        checkBody(checkWindowValidationSchema)
        const result = await getValidationResult()
        validationError = errorConverter.fromExpressValidator(result.mapped())

        if (adminStartDate !== undefined && adminStartDate.isValid() === false) {
          validationError.addError('adminDateInvalid', true)
        }
        if (checkStartDate !== undefined && checkStartDate.isValid() === false) {
          validationError.addError('checkStartDateInvalid', true)
        }
        if (requestData['checkEndDay'] && requestData['checkEndMonth'] && requestData['checkEndYear'] && checkEndDate.isValid() === false) {
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
            checkWindowValidationBasicSchema,
            checkWindowValidationSchemaAdminDate
          )
        }

        if (checkStartDate !== undefined) {
          checkWindowValidationSchema = Object.assign(
            checkWindowValidationBasicSchema,
            checkWindowValidationSchemaCheckStart
          )
        }
        checkBody(checkWindowValidationSchema)
        const result = await getValidationResult()
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
          adminStartDate = adminStartDate || moment.utc(requestData['existingAdminStartDate'])
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
        checkStartDate = checkStartDate || moment.utc(requestData['existingCheckStartDate'])
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
