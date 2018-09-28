'use strict'
const R = require('ramda')

const checkWindowErrorMessages = require('../../errors/check-window-v2')
const dateService = require('../../../services/date.service')
const ValidationError = require('../../validation-error')

const checkWindowNameValidator = require('./check-window-name-validator')
const dateValidator = require('../common/date-validator')

const checkWindowAddValidator = {}

/**
 * Validates check window insertion data
 * @param {Object} checkWindowData
 * @returns {Object}
 */
checkWindowAddValidator.validate = (checkWindowData) => {
  const validationError = new ValidationError()
  const checkWindowName = R.path(['checkWindowName'], checkWindowData)
  checkWindowNameValidator.validate(validationError, checkWindowName)

  const { adminStartDay, adminStartMonth, adminStartYear } = R.pick(['adminStartDay', 'adminStartMonth', 'adminStartYear'], checkWindowData)
  const adminStartDateValidationData = [adminStartDay, adminStartMonth, adminStartYear, 'adminStartDay', 'adminStartMonth', 'adminStartYear',
    checkWindowErrorMessages.adminStartDayWrong, checkWindowErrorMessages.adminStartMonthWrong, checkWindowErrorMessages.adminStartYearWrong,
    checkWindowErrorMessages.adminStartDayInvalidChars, checkWindowErrorMessages.adminStartMonthInvalidChars, checkWindowErrorMessages.adminStartYearInvalidChars,
    'adminStartDateInThePast']
  const adminStartDateData = checkWindowAddValidator.generateValidationData(adminStartDateValidationData)
  dateValidator.validate(validationError, adminStartDateData)

  const { adminEndDay, adminEndMonth, adminEndYear } = R.pick(['adminEndDay', 'adminEndMonth', 'adminEndYear'], checkWindowData)
  const adminEndDateValidationData = [adminEndDay, adminEndMonth, adminEndYear, 'adminEndDay', 'adminEndMonth', 'adminEndYear',
    checkWindowErrorMessages.adminEndDayWrong, checkWindowErrorMessages.adminEndMonthWrong, checkWindowErrorMessages.adminEndYearWrong,
    checkWindowErrorMessages.adminEndDayInvalidChars, checkWindowErrorMessages.adminEndMonthInvalidChars, checkWindowErrorMessages.adminEndYearInvalidChars,
    'adminEndDateInThePast']
  const adminEndDateData = checkWindowAddValidator.generateValidationData(adminEndDateValidationData)
  dateValidator.validate(validationError, adminEndDateData)

  const { familiarisationCheckStartDay, familiarisationCheckStartMonth, familiarisationCheckStartYear } = R.pick(['familiarisationCheckStartDay', 'familiarisationCheckStartMonth', 'familiarisationCheckStartYear'], checkWindowData)
  const familiarisationCheckStartDateValidationData = [familiarisationCheckStartDay, familiarisationCheckStartMonth, familiarisationCheckStartYear, 'familiarisationCheckStartDay', 'familiarisationCheckStartMonth', 'familiarisationCheckStartYear',
    checkWindowErrorMessages.familiarisationCheckStartDayWrong, checkWindowErrorMessages.familiarisationCheckStartMonthWrong, checkWindowErrorMessages.familiarisationCheckStartYearWrong,
    checkWindowErrorMessages.familiarisationCheckStartDayInvalidChars, checkWindowErrorMessages.familiarisationCheckStartMonthInvalidChars, checkWindowErrorMessages.familiarisationCheckStartYearInvalidChars,
    'familiarisationCheckStartDateInThePast']
  const familiarisationCheckStartDateData = checkWindowAddValidator.generateValidationData(familiarisationCheckStartDateValidationData)
  dateValidator.validate(validationError, familiarisationCheckStartDateData)

  const { familiarisationCheckEndDay, familiarisationCheckEndMonth, familiarisationCheckEndYear } = R.pick(['familiarisationCheckEndDay', 'familiarisationCheckEndMonth', 'familiarisationCheckEndYear'], checkWindowData)
  const familiarisationCheckEndDateValidationData = [familiarisationCheckEndDay, familiarisationCheckEndMonth, familiarisationCheckEndYear, 'familiarisationCheckEndDay', 'familiarisationCheckEndMonth', 'familiarisationCheckEndYear',
    checkWindowErrorMessages.familiarisationCheckEndDayWrong, checkWindowErrorMessages.familiarisationCheckEndMonthWrong, checkWindowErrorMessages.familiarisationCheckEndYearWrong,
    checkWindowErrorMessages.familiarisationCheckEndDayInvalidChars, checkWindowErrorMessages.familiarisationCheckEndMonthInvalidChars, checkWindowErrorMessages.familiarisationCheckEndYearInvalidChars,
    'familiarisationCheckEndDateInThePast']
  const familiarisationCheckEndDateData = checkWindowAddValidator.generateValidationData(familiarisationCheckEndDateValidationData)
  dateValidator.validate(validationError, familiarisationCheckEndDateData)

  const { liveCheckStartDay, liveCheckStartMonth, liveCheckStartYear } = R.pick(['liveCheckStartDay', 'liveCheckStartMonth', 'liveCheckStartYear'], checkWindowData)
  const liveCheckStartDateValidationData = [liveCheckStartDay, liveCheckStartMonth, liveCheckStartYear, 'liveCheckStartDay', 'liveCheckStartMonth', 'liveCheckStartYear',
    checkWindowErrorMessages.liveCheckStartDayWrong, checkWindowErrorMessages.liveCheckStartMonthWrong, checkWindowErrorMessages.liveCheckStartYearWrong,
    checkWindowErrorMessages.liveCheckStartDayInvalidChars, checkWindowErrorMessages.liveCheckStartMonthInvalidChars, checkWindowErrorMessages.liveCheckStartYearInvalidChars,
    'liveCheckStartDateInThePast']
  const liveCheckStartDateData = checkWindowAddValidator.generateValidationData(liveCheckStartDateValidationData)
  dateValidator.validate(validationError, liveCheckStartDateData)

  const { liveCheckEndDay, liveCheckEndMonth, liveCheckEndYear } = R.pick(['liveCheckEndDay', 'liveCheckEndMonth', 'liveCheckEndYear'], checkWindowData)
  const liveCheckEndDateValidationData = [liveCheckEndDay, liveCheckEndMonth, liveCheckEndYear, 'liveCheckEndDay', 'liveCheckEndMonth', 'liveCheckEndYear',
    checkWindowErrorMessages.liveCheckEndDayWrong, checkWindowErrorMessages.liveCheckEndMonthWrong, checkWindowErrorMessages.liveCheckEndYearWrong,
    checkWindowErrorMessages.liveCheckEndDayInvalidChars, checkWindowErrorMessages.liveCheckEndMonthInvalidChars, checkWindowErrorMessages.liveCheckEndYearInvalidChars,
    'liveCheckEndDateInThePast']
  const liveCheckEndDateData = checkWindowAddValidator.generateValidationData(liveCheckEndDateValidationData)
  dateValidator.validate(validationError, liveCheckEndDateData)

  const adminStartDate = dateService.createUTCFromDayMonthYear(checkWindowData['adminStartDay'],
    checkWindowData['adminStartMonth'], checkWindowData['adminStartYear'])
  const adminEndDate = dateService.createUTCFromDayMonthYear(checkWindowData['adminEndDay'],
    checkWindowData['adminEndMonth'], checkWindowData['adminEndYear'])
  const familiarisationCheckStartDate = dateService.createUTCFromDayMonthYear(checkWindowData['familiarisationCheckStartDay'],
    checkWindowData['familiarisationCheckStartMonth'], checkWindowData['familiarisationCheckStartYear'])
  const familiarisationCheckEndDate = dateService.createUTCFromDayMonthYear(checkWindowData['familiarisationCheckEndDay'],
    checkWindowData['familiarisationCheckEndMonth'], checkWindowData['familiarisationCheckEndYear'])
  const liveCheckStartDate = dateService.createUTCFromDayMonthYear(checkWindowData['liveCheckStartDay'],
    checkWindowData['liveCheckStartMonth'], checkWindowData['liveCheckStartYear'])
  const liveCheckEndDate = dateService.createUTCFromDayMonthYear(checkWindowData['liveCheckEndDay'],
    checkWindowData['liveCheckEndMonth'], checkWindowData['liveCheckEndYear'])

  // Compare date fields
  // Admin start date
  if (adminStartDate && adminStartDate.isAfter(familiarisationCheckStartDate)) {
    validationError.addError('adminStartDateAfterFamiliarisationCheckStartDate', true)
  }
  if (adminStartDate && adminStartDate.isAfter(liveCheckStartDate)) {
    validationError.addError('adminStartDateAfterLiveCheckStartDate', true)
  }
  // Admin end date
  if (adminEndDate && adminEndDate.isBefore(adminStartDate)) {
    validationError.addError('adminEndDateBeforeAdminStartDate', true)
  }
  if (adminEndDate && adminEndDate.isBefore(liveCheckEndDate)) {
    validationError.addError('adminEndDateBeforeLiveCheckEndDate', true)
  }
  if (adminEndDate && adminEndDate.isBefore(familiarisationCheckEndDate)) {
    validationError.addError('adminEndDateBeforeFamiliarisationCheckEndDate', true)
  }
  // Familiarisation check start date
  if (familiarisationCheckStartDate && familiarisationCheckStartDate.isAfter(liveCheckStartDate)) {
    validationError.addError('familiarisationCheckStartDateAfterLiveCheckStartDate', true)
  }
  if (familiarisationCheckStartDate && familiarisationCheckStartDate.isAfter(familiarisationCheckEndDate)) {
    validationError.addError('familiarisationCheckStartDateAfterFamiliarisationCheckEndDate', true)
  }
  // Familiarisation check end date
  if (familiarisationCheckEndDate && familiarisationCheckEndDate.isBefore(adminStartDate)) {
    validationError.addError('familiarisationCheckEndDateBeforeAdminStartDate', true)
  }
  // Live check start date
  if (liveCheckStartDate && liveCheckStartDate.isAfter(liveCheckEndDate)) {
    validationError.addError('liveCheckStartDateAfterLiveCheckEndDate', true)
  }
  // Live check end date
  if (liveCheckEndDate && liveCheckEndDate.isBefore(adminStartDate)) {
    validationError.addError('liveCheckEndDateBeforeAdminStartDate', true)
  }
  return validationError
}

checkWindowAddValidator.generateValidationData = (dateData) => {
  return {
    day: dateData[0],
    month: dateData[1],
    year: dateData[2],
    dayHTMLAttributeId: dateData[3],
    monthHTMLAttributeId: dateData[4],
    yearHTMLAttributeId: dateData[5],
    wrongDayMessage: dateData[6],
    wrongMonthMessage: dateData[7],
    wrongYearMessage: dateData[8],
    dayInvalidChars: dateData[9],
    monthInvalidChars: dateData[10],
    yearInvalidChars: dateData[11],
    dateInThePast: dateData[12]
  }
}
module.exports = checkWindowAddValidator
