'use strict'

const moment = require('moment')
const { isEmpty, isInt } = require('validator')
const XRegExp = require('xregexp')

const dateService = require('../../../services/date.service')

const dateValidator = {}

/**
 * Validates 3-part date data (day, month, year)
 * @param {Object} validationError
 * @param {Object} dateData
 */
dateValidator.validate = (validationError, dateData) => {
  const currentDate = moment.utc()
  const currentYear = (new Date()).getFullYear()
  const utcDate = dateService.createUTCFromDayMonthYear(dateData.day,
    dateData.month, dateData.year)
  const maxDaysInMonth = utcDate && utcDate.daysInMonth()

  const yearWithinRange = isInt(dateData.year, { min: currentYear, max: (currentYear + 10) })
  const monthWithinRange = isInt(dateData.month, { min: 1, max: 12 })

  // Day
  const isDayEmpty = isEmpty(dateData.day.trim())
  const hasWrongDayInMonth = !utcDate && !!dateData.day && monthWithinRange && yearWithinRange
  if (isDayEmpty || hasWrongDayInMonth || (utcDate && !isInt(dateData.day, { min: 1, max: maxDaysInMonth }))) {
    validationError.addError(dateData.dayHTMLAttributeId, dateData.wrongDayMessage)
  }
  if (!isDayEmpty && !XRegExp('^[1-9]\\d{0,1}$').test(parseInt(dateData.day))) {
    validationError.addError(dateData.dayHTMLAttributeId, dateData.dayInvalidChars)
  }
  // Month
  const isMonthEmpty = isEmpty(dateData.month.trim())
  if (isMonthEmpty || (!isMonthEmpty && !monthWithinRange)) {
    validationError.addError(dateData.monthHTMLAttributeId, dateData.wrongMonthMessage)
  }
  if (!isMonthEmpty && !XRegExp('^[1-9]\\d{0,1}$').test(parseInt(dateData.month))) {
    validationError.addError(dateData.monthHTMLAttributeId, dateData.monthInvalidChars)
  }
  // Year
  const isYearEmpty = isEmpty(dateData.year.trim())
  if (isYearEmpty || (!isYearEmpty && !yearWithinRange)) {
    validationError.addError(dateData.yearHTMLAttributeId, dateData.wrongYearMessage)
  }
  if (!isYearEmpty && (!XRegExp('^[0-9]+$').test(dateData.year) || dateData.year.length !== 4)) {
    validationError.addError(dateData.yearHTMLAttributeId, dateData.yearInvalidChars)
  }

  // UTC Date
  if (utcDate && currentDate.isAfter(utcDate, 'days')) {
    validationError.addError(dateData.dateInThePast, true)
  }
  return validationError
}

module.exports = dateValidator
