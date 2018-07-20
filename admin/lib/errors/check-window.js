'use strict'

module.exports = {
  checkWindowName: '"Name of check window" is required',
  checkWindowNameLength: '"Name of check window" can\'t be less than 2 characters',

  adminStartDayWrongDay: 'Enter a valid day for administration start date',
  adminStartDayInvalidChars: 'Enter a day in 2 digits for administration start date',
  adminStartDayRequired: '"Administration start day" is required',

  adminStartMonthWrongDay: 'Enter a valid month for administration start date',
  adminStartMonthInvalidChars: 'Enter a month in 2 digits for administration start date',
  adminStartMonthRequired: '"Administration start month" is required',

  adminStartYearWrongDay: 'Enter a valid year for administration start date',
  adminStartYearInvalidChars: 'Enter a year in 4 digits for administration start date',
  adminStartYearRequired: '"Administration start year" is required',

  checkStartDayWrongDay: 'Enter a valid day for check start date',
  checkStartDayInvalidChars: 'Enter a day in 2 digits for check start date',
  checkStartDayRequired: '"Check start day" is required',

  checkStartMonthWrongDay: 'Enter a valid month for check start date',
  checkStartMonthInvalidChars: 'Enter a month in 2 digits for check start date',
  checkStartMonthRequired: '"Check start month" is required',

  checkStartYearWrongDay: 'Enter a valid year for check start date',
  checkStartYearInvalidChars: 'Enter a year in 4 digits for check start date',
  checkStartYearRequired: '"Check start year" is required',

  checkEndDayWrongDay: 'Enter a valid day for check end date',
  checkEndDayInvalidChars: 'Enter a day in 2 digits for check end date',
  checkEndDayRequired: '"Check end day" is required',

  checkEndMonthWrongDay: 'Enter a valid month for check end date',
  checkEndMonthInvalidChars: 'Enter a month in 2 digits for check end date',
  checkEndMonthRequired: '"Check end month" is required',

  checkEndYearWrongDay: 'Enter a valid year for check end date',
  checkEndYearInvalidChars: 'Enter a year in 4 digits for check end date',
  checkEndYearRequired: '"Check end year" is required',

  adminDateInThePast: 'Start date must be in the future',
  checkDateBeforeAdminDate: '"Check start date" must occur after the "Administration start date"',
  checkStartDateAfterEndDate: '"Check start date" must occur before the "Check end date"',
  checkStartDateInThePast: '"Check start date" must be in the future',
  checkEndDateInThePast: '"Check end date" must be in the future',
  checkEndDateBeforeStartDate: '"Check end date" must occur after "Check start date"'
}
