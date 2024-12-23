'use strict'
const R = require('ramda')

const checkWindowErrorMessages = require('../../errors/check-window-v2')
const dateService = require('../../../services/date.service')

const ValidationError = require('../../validation-error')

const checkWindowNameValidator = require('./check-window-name-validator')
const dateValidator = require('../common/date-validator')
const DateValidationData = require('../common/DateValidationData')

const checkWindowAddValidator = {}

/**
 * Validates check window insertion data
 * @param {Object} checkWindowData
 * @param {Object} validationConfig set of rules for validation
 * @returns {ValidationError}
 */
checkWindowAddValidator.validate = (checkWindowData, validationConfig = null) => {
  const validationError = new ValidationError()
  const checkWindowName = R.path(['checkWindowName'], checkWindowData)
  checkWindowNameValidator.validate(validationError, checkWindowName)
  let adminStartDateDisabled = false
  let adminEndDateDisabled = false
  let familiarisationCheckStartDateDisabled = false
  let familiarisationCheckEndDateDisabled = false
  let liveCheckStartDateDisabled = false
  let liveCheckEndDateDisabled = false

  if (validationConfig) {
    adminStartDateDisabled = validationConfig.adminStartDateDisabled
    adminEndDateDisabled = validationConfig.adminEndDateDisabled
    familiarisationCheckStartDateDisabled = validationConfig.familiarisationCheckStartDateDisabled
    familiarisationCheckEndDateDisabled = validationConfig.familiarisationCheckEndDateDisabled
    liveCheckStartDateDisabled = validationConfig.liveCheckStartDateDisabled
    liveCheckEndDateDisabled = validationConfig.liveCheckEndDateDisabled
  }

  const {
    adminStartDay,
    adminStartMonth,
    adminStartYear,
    adminEndDay,
    adminEndMonth,
    adminEndYear,
    familiarisationCheckStartDay,
    familiarisationCheckStartMonth,
    familiarisationCheckStartYear,
    familiarisationCheckEndDay,
    familiarisationCheckEndMonth,
    familiarisationCheckEndYear,
    liveCheckStartDay,
    liveCheckStartMonth,
    liveCheckStartYear,
    liveCheckEndDay,
    liveCheckEndMonth,
    liveCheckEndYear
  } = checkWindowData

  const adminStartDateData = new DateValidationData()
  adminStartDateData
    .day(adminStartDay)
    .month(adminStartMonth)
    .year(adminStartYear)
    .dayHTMLAttributeId('adminStartDay')
    .monthHTMLAttributeId('adminStartMonth')
    .yearHTMLAttributeId('adminStartYear')
    .wrongDayMessage(checkWindowErrorMessages.adminStartDayWrong)
    .wrongMonthMessage(checkWindowErrorMessages.adminStartMonthWrong)
    .wrongYearMessage(checkWindowErrorMessages.adminStartYearWrong)
    .dayInvalidChars(checkWindowErrorMessages.adminStartDayInvalidChars)
    .monthInvalidChars(checkWindowErrorMessages.adminStartMonthInvalidChars)
    .yearInvalidChars(checkWindowErrorMessages.adminStartYearInvalidChars)
    .dateInThePast('adminStartDateInThePast')
  if (!adminStartDateDisabled) {
    dateValidator.validate(validationError, adminStartDateData)
  }

  const adminEndDateData = new DateValidationData()
  adminEndDateData
    .day(adminEndDay)
    .month(adminEndMonth)
    .year(adminEndYear)
    .dayHTMLAttributeId('adminEndDay')
    .monthHTMLAttributeId('adminEndMonth')
    .yearHTMLAttributeId('adminEndYear')
    .wrongDayMessage(checkWindowErrorMessages.adminEndDayWrong)
    .wrongMonthMessage(checkWindowErrorMessages.adminEndMonthWrong)
    .wrongYearMessage(checkWindowErrorMessages.adminEndYearWrong)
    .dayInvalidChars(checkWindowErrorMessages.adminEndDayInvalidChars)
    .monthInvalidChars(checkWindowErrorMessages.adminEndMonthInvalidChars)
    .yearInvalidChars(checkWindowErrorMessages.adminEndYearInvalidChars)
    .dateInThePast('adminEndDateInThePast')
  if (!adminEndDateDisabled) {
    dateValidator.validate(validationError, adminEndDateData, true)
  }

  const familiarisationCheckStartDateData = new DateValidationData()
  familiarisationCheckStartDateData
    .day(familiarisationCheckStartDay)
    .month(familiarisationCheckStartMonth)
    .year(familiarisationCheckStartYear)
    .dayHTMLAttributeId('familiarisationCheckStartDay')
    .monthHTMLAttributeId('familiarisationCheckStartMonth')
    .yearHTMLAttributeId('familiarisationCheckStartYear')
    .wrongDayMessage(checkWindowErrorMessages.familiarisationCheckStartDayWrong)
    .wrongMonthMessage(checkWindowErrorMessages.familiarisationCheckStartMonthWrong)
    .wrongYearMessage(checkWindowErrorMessages.familiarisationCheckStartYearWrong)
    .dayInvalidChars(checkWindowErrorMessages.familiarisationCheckStartDayInvalidChars)
    .monthInvalidChars(checkWindowErrorMessages.familiarisationCheckStartMonthInvalidChars)
    .yearInvalidChars(checkWindowErrorMessages.familiarisationCheckStartYearInvalidChars)
    .dateInThePast('familiarisationCheckStartDateInThePast')
  if (!familiarisationCheckStartDateDisabled) {
    dateValidator.validate(validationError, familiarisationCheckStartDateData)
  }
  const familiarisationCheckEndDateData = new DateValidationData()
  familiarisationCheckEndDateData
    .day(familiarisationCheckEndDay)
    .month(familiarisationCheckEndMonth)
    .year(familiarisationCheckEndYear)
    .dayHTMLAttributeId('familiarisationCheckEndDay')
    .monthHTMLAttributeId('familiarisationCheckEndMonth')
    .yearHTMLAttributeId('familiarisationCheckEndYear')
    .wrongDayMessage(checkWindowErrorMessages.familiarisationCheckEndDayWrong)
    .wrongMonthMessage(checkWindowErrorMessages.familiarisationCheckEndMonthWrong)
    .wrongYearMessage(checkWindowErrorMessages.familiarisationCheckEndYearWrong)
    .dayInvalidChars(checkWindowErrorMessages.familiarisationCheckEndDayInvalidChars)
    .monthInvalidChars(checkWindowErrorMessages.familiarisationCheckEndMonthInvalidChars)
    .yearInvalidChars(checkWindowErrorMessages.familiarisationCheckEndYearInvalidChars)
    .dateInThePast('familiarisationCheckEndDateInThePast')
  if (!familiarisationCheckEndDateDisabled) {
    dateValidator.validate(validationError, familiarisationCheckEndDateData, true)
  }
  const liveCheckStartDateData = new DateValidationData()
  liveCheckStartDateData
    .day(liveCheckStartDay)
    .month(liveCheckStartMonth)
    .year(liveCheckStartYear)
    .dayHTMLAttributeId('liveCheckStartDay')
    .monthHTMLAttributeId('liveCheckStartMonth')
    .yearHTMLAttributeId('liveCheckStartYear')
    .wrongDayMessage(checkWindowErrorMessages.liveCheckStartDayWrong)
    .wrongMonthMessage(checkWindowErrorMessages.liveCheckStartMonthWrong)
    .wrongYearMessage(checkWindowErrorMessages.liveCheckStartYearWrong)
    .dayInvalidChars(checkWindowErrorMessages.liveCheckStartDayInvalidChars)
    .monthInvalidChars(checkWindowErrorMessages.liveCheckStartMonthInvalidChars)
    .yearInvalidChars(checkWindowErrorMessages.liveCheckStartYearInvalidChars)
    .dateInThePast('liveCheckStartDateInThePast')
  if (!liveCheckStartDateDisabled) {
    dateValidator.validate(validationError, liveCheckStartDateData)
  }
  const liveCheckEndDateData = new DateValidationData()
  liveCheckEndDateData
    .day(liveCheckEndDay)
    .month(liveCheckEndMonth)
    .year(liveCheckEndYear)
    .dayHTMLAttributeId('liveCheckEndDay')
    .monthHTMLAttributeId('liveCheckEndMonth')
    .yearHTMLAttributeId('liveCheckEndYear')
    .wrongDayMessage(checkWindowErrorMessages.liveCheckEndDayWrong)
    .wrongMonthMessage(checkWindowErrorMessages.liveCheckEndMonthWrong)
    .wrongYearMessage(checkWindowErrorMessages.liveCheckEndYearWrong)
    .dayInvalidChars(checkWindowErrorMessages.liveCheckEndDayInvalidChars)
    .monthInvalidChars(checkWindowErrorMessages.liveCheckEndMonthInvalidChars)
    .yearInvalidChars(checkWindowErrorMessages.liveCheckEndYearInvalidChars)
    .dateInThePast('liveCheckEndDateInThePast')
  if (!liveCheckEndDateDisabled) {
    dateValidator.validate(validationError, liveCheckEndDateData, true)
  }
  let adminStartDate
  let adminEndDate
  let familiarisationCheckStartDate
  let familiarisationCheckEndDate
  let liveCheckStartDate
  let liveCheckEndDate

  if (!adminStartDateDisabled) {
    adminStartDate = dateService.createUTCFromDayMonthYear(checkWindowData.adminStartDay,
      checkWindowData.adminStartMonth, checkWindowData.adminStartYear)
  }
  if (!adminEndDateDisabled) {
    adminEndDate = dateService.createUTCFromDayMonthYear(checkWindowData.adminEndDay,
      checkWindowData.adminEndMonth, checkWindowData.adminEndYear)
  }
  if (!familiarisationCheckStartDateDisabled) {
    familiarisationCheckStartDate = dateService.createUTCFromDayMonthYear(checkWindowData.familiarisationCheckStartDay,
      checkWindowData.familiarisationCheckStartMonth, checkWindowData.familiarisationCheckStartYear)
  }
  if (!familiarisationCheckEndDateDisabled) {
    familiarisationCheckEndDate = dateService.createUTCFromDayMonthYear(checkWindowData.familiarisationCheckEndDay,
      checkWindowData.familiarisationCheckEndMonth, checkWindowData.familiarisationCheckEndYear)
  }
  if (!liveCheckStartDateDisabled) {
    liveCheckStartDate = dateService.createUTCFromDayMonthYear(checkWindowData.liveCheckStartDay,
      checkWindowData.liveCheckStartMonth, checkWindowData.liveCheckStartYear)
  }
  if (!liveCheckEndDateDisabled) {
    liveCheckEndDate = dateService.createUTCFromDayMonthYear(checkWindowData.liveCheckEndDay,
      checkWindowData.liveCheckEndMonth, checkWindowData.liveCheckEndYear)
  }

  // Compare date fields
  // Admin start date
  if (adminStartDate && adminStartDate.isAfter(adminEndDate, 'days')) {
    validationError.addError('adminStartDateAfterAdminEndDate', true)
  }
  if (adminStartDate && adminStartDate.isAfter(familiarisationCheckStartDate)) {
    validationError.addError('adminStartDateAfterFamiliarisationCheckStartDate', true)
  }
  if (adminStartDate && adminStartDate.isAfter(liveCheckStartDate)) {
    validationError.addError('adminStartDateAfterLiveCheckStartDate', true)
  }
  // Admin end date
  if (adminEndDate && !adminStartDateDisabled && adminEndDate.isBefore(adminStartDate, 'days')) {
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
  if (familiarisationCheckStartDate && familiarisationCheckStartDate.isAfter(familiarisationCheckEndDate, 'days')) {
    validationError.addError('familiarisationCheckStartDateAfterFamiliarisationCheckEndDate', true)
  }
  if (familiarisationCheckStartDate && familiarisationCheckStartDate.isBefore(adminStartDate)) {
    validationError.addError('familiarisationCheckStartDateBeforeAdminStartDate', true)
  }
  // Familiarisation check end date
  if (familiarisationCheckEndDate && !adminStartDateDisabled && familiarisationCheckEndDate.isBefore(adminStartDate, 'days')) {
    validationError.addError('familiarisationCheckEndDateBeforeAdminStartDate', true)
  }
  if (familiarisationCheckEndDate && familiarisationCheckEndDate.isAfter(adminEndDate)) {
    validationError.addError('familiarisationCheckEndDateAfterAdminEndDate', true)
  }
  if (familiarisationCheckEndDate && !familiarisationCheckStartDateDisabled && familiarisationCheckEndDate.isBefore(familiarisationCheckStartDate, 'days')) {
    validationError.addError('familiarisationCheckEndDateBeforeFamiliarisationCheckStartDate', true)
  }
  if (familiarisationCheckEndDate && !familiarisationCheckEndDate.isSame(liveCheckEndDate)) {
    validationError.addError('familiarisationCheckEndDateNotEqualLiveCheckEndDate', true)
  }
  // Live check start date
  if (liveCheckStartDate && liveCheckStartDate.isAfter(liveCheckEndDate, 'days')) {
    validationError.addError('liveCheckStartDateAfterLiveCheckEndDate', true)
  }
  if (liveCheckStartDate && liveCheckStartDate.isBefore(adminStartDate)) {
    validationError.addError('liveCheckStartDateBeforeAdminStartDate', true)
  }
  if (liveCheckStartDate && liveCheckStartDate.isBefore(familiarisationCheckStartDate)) {
    validationError.addError('liveCheckStartDateBeforeFamiliarisationCheckStartDate', true)
  }
  // Live check end date
  if (liveCheckEndDate && !adminStartDateDisabled && liveCheckEndDate.isBefore(adminStartDate, 'days')) {
    validationError.addError('liveCheckEndDateBeforeAdminStartDate', true)
  }
  if (liveCheckEndDate && liveCheckEndDate.isAfter(adminEndDate)) {
    validationError.addError('liveCheckEndDateAfterAdminEndDate', true)
  }
  if (liveCheckEndDate && !liveCheckStartDateDisabled && liveCheckEndDate.isBefore(liveCheckStartDate, 'days')) {
    validationError.addError('liveCheckEndDateBeforeLiveCheckStartDate', true)
  }
  if (liveCheckEndDate && !liveCheckEndDate.isSame(familiarisationCheckEndDate)) {
    validationError.addError('liveCheckEndDateNotEqualFamiliarisationCheckEndDate', true)
  }
  return validationError
}

module.exports = checkWindowAddValidator
