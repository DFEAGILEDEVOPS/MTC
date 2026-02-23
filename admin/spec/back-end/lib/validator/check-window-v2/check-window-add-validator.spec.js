'use strict'

const moment = require('moment')

const checkWindowAddValidator = require('../../../../../lib/validator/check-window-v2/check-window-add-validator')
const checkWindowNameValidator = require('../../../../../lib/validator/check-window-v2/check-window-name-validator')
const dateService = require('../../../../../services/date.service')
const dateValidator = require('../../../../../lib/validator/common/date-validator')
const DateValidationData = require('../../../../../lib/validator/common/DateValidationData')
const DateValidationDataMock = require('../common/DateValidationDataMock')

describe('New check window add validator', function () {
  let checkWindowData

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('validate', function () {
    beforeEach(() => {
      jest.spyOn(checkWindowNameValidator, 'validate').mockImplementation()
      jest.spyOn(dateValidator, 'validate').mockImplementation()
      jest.spyOn(DateValidationData.prototype, 'day').mockReturnValue(DateValidationDataMock)
      checkWindowData = {
        adminStartDay: moment.utc().add(1, 'days').format('DD'),
        adminStartMonth: moment.utc().add(1, 'days').format('MM'),
        adminStartYear: moment.utc().add(1, 'days').format('YYYY'),
        adminEndDay: moment.utc().add(10, 'days').format('DD'),
        adminEndMonth: moment.utc().add(10, 'days').format('MM'),
        adminEndYear: moment.utc().add(10, 'days').format('YYYY'),
        familiarisationCheckStartDay: moment.utc().add(2, 'days').format('DD'),
        familiarisationCheckStartMonth: moment.utc().add(2, 'days').format('MM'),
        familiarisationCheckStartYear: moment.utc().add(2, 'days').format('YYYY'),
        familiarisationCheckEndDay: moment.utc().add(8, 'days').format('DD'),
        familiarisationCheckEndMonth: moment.utc().add(8, 'days').format('MM'),
        familiarisationCheckEndYear: moment.utc().add(8, 'days').format('YYYY'),
        liveCheckStartDay: moment.utc().add(4, 'days').format('DD'),
        liveCheckStartMonth: moment.utc().add(4, 'days').format('MM'),
        liveCheckStartYear: moment.utc().add(4, 'days').format('YYYY'),
        liveCheckEndDay: moment.utc().add(8, 'days').format('DD'),
        liveCheckEndMonth: moment.utc().add(8, 'days').format('MM'),
        liveCheckEndYear: moment.utc().add(8, 'days').format('YYYY')
      }
    })
    test('returns validationError object', () => {
      const validationError = checkWindowAddValidator.validate(checkWindowData)
      expect(dateValidator.validate).toHaveBeenCalled()
      expect(validationError.hasError()).toBeFalsy()
    })
    test('calls addError with adminStartDateAfterFamiliarisationCheckStartDate and familiarisationCheckStartDateBeforeAdminStartDate if the admin start day is after familiarisation check start date', () => {
      checkWindowData.adminStartDay = moment.utc().add(3, 'days').format('DD')
      checkWindowData.adminStartMonth = moment.utc().add(3, 'days').format('MM')
      checkWindowData.adminStartYear = moment.utc().add(3, 'days').format('YYYY')
      const validationError = checkWindowAddValidator.validate(checkWindowData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.errors.adminStartDateAfterFamiliarisationCheckStartDate).toBeTruthy()
      expect(validationError.errors.familiarisationCheckStartDateBeforeAdminStartDate).toBeTruthy()
    })
    test('calls addError with adminStartDateAfterLiveCheckStartDate and liveCheckStartDateBeforeAdminStartDate if the admin start day is after live check start date', () => {
      checkWindowData.adminStartDay = moment.utc().add(5, 'days').format('DD')
      checkWindowData.adminStartMonth = moment.utc().add(5, 'days').format('MM')
      checkWindowData.adminStartYear = moment.utc().add(5, 'days').format('YYYY')
      const validationError = checkWindowAddValidator.validate(checkWindowData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.errors.adminStartDateAfterLiveCheckStartDate).toBeTruthy()
      expect(validationError.errors.liveCheckStartDateBeforeAdminStartDate).toBeTruthy()
    })
    test('calls addError with adminEndDateBeforeAdminStartDate and adminStartDateAfterAdminEndDate if the admin end day is before admin start date', () => {
      checkWindowData.adminEndDay = moment.utc().format('DD')
      checkWindowData.adminEndMonth = moment.utc().format('MM')
      checkWindowData.adminEndYear = moment.utc().format('YYYY')
      const validationError = checkWindowAddValidator.validate(checkWindowData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.errors.adminEndDateBeforeAdminStartDate).toBeTruthy()
      expect(validationError.errors.adminStartDateAfterAdminEndDate).toBeTruthy()
    })
    test('calls addError with adminEndDateBeforeLiveCheckEndDate if the admin end day is before live check end date', () => {
      checkWindowData.adminEndDay = moment.utc().format('DD')
      checkWindowData.adminEndMonth = moment.utc().format('MM')
      checkWindowData.adminEndYear = moment.utc().format('YYYY')
      const validationError = checkWindowAddValidator.validate(checkWindowData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.errors.adminEndDateBeforeLiveCheckEndDate).toBeTruthy()
    })
    test('calls addError with adminEndDateBeforeFamiliarisationCheckEndDate, familiarisationCheckEndDateAfterAdminEndDate ' +
      ' and liveCheckEndDateAfterAdminEndDate if the admin end day is before familiarisation check end date', () => {
      checkWindowData.adminEndDay = moment.utc().format('DD')
      checkWindowData.adminEndMonth = moment.utc().format('MM')
      checkWindowData.adminEndYear = moment.utc().format('YYYY')
      const validationError = checkWindowAddValidator.validate(checkWindowData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.errors.adminEndDateBeforeFamiliarisationCheckEndDate).toBeTruthy()
      expect(validationError.errors.familiarisationCheckEndDateAfterAdminEndDate).toBeTruthy()
      expect(validationError.errors.liveCheckEndDateAfterAdminEndDate).toBeTruthy()
    })
    test('calls addError with familiarisationCheckStartDateAfterLiveCheckStartDate and liveCheckStartDateBeforeFamiliarisationCheckStartDate if the familiarisation check start day is after live check start date', () => {
      checkWindowData.familiarisationCheckStartDay = moment.utc().add(5, 'days').format('DD')
      checkWindowData.familiarisationCheckStartMonth = moment.utc().add(5, 'days').format('MM')
      checkWindowData.familiarisationCheckStartYear = moment.utc().add(5, 'days').format('YYYY')
      const validationError = checkWindowAddValidator.validate(checkWindowData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.errors.familiarisationCheckStartDateAfterLiveCheckStartDate).toBeTruthy()
      expect(validationError.errors.liveCheckStartDateBeforeFamiliarisationCheckStartDate).toBeTruthy()
    })
    test('calls addError with familiarisationCheckStartDateAfterFamiliarisationCheckEndDate and familiarisationCheckEndDateBeforeFamiliarisationCheckStartDate if the familiarisation check start day is after familiarisation check end date', () => {
      checkWindowData.familiarisationCheckStartDay = moment.utc().add(9, 'days').format('DD')
      checkWindowData.familiarisationCheckStartMonth = moment.utc().add(9, 'days').format('MM')
      checkWindowData.familiarisationCheckStartYear = moment.utc().add(9, 'days').format('YYYY')
      const validationError = checkWindowAddValidator.validate(checkWindowData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.errors.familiarisationCheckStartDateAfterFamiliarisationCheckEndDate).toBeTruthy()
      expect(validationError.errors.familiarisationCheckEndDateBeforeFamiliarisationCheckStartDate).toBeTruthy()
    })
    test('calls addError with familiarisationCheckEndDateBeforeAdminStartDate if the familiarisation check end day is before admin start date', () => {
      checkWindowData.familiarisationCheckEndDay = moment.utc().format('DD')
      checkWindowData.familiarisationCheckEndMonth = moment.utc().format('MM')
      checkWindowData.familiarisationCheckEndYear = moment.utc().format('YYYY')
      const validationError = checkWindowAddValidator.validate(checkWindowData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.errors.familiarisationCheckEndDateBeforeAdminStartDate).toBeTruthy()
    })
    test('calls addError with liveCheckStartDateAfterLiveCheckEndDate and liveCheckEndDateBeforeLiveCheckStartDate if the live check start day is after live check end date', () => {
      checkWindowData.liveCheckStartDay = moment.utc().add(9, 'days').format('DD')
      checkWindowData.liveCheckStartMonth = moment.utc().add(9, 'days').format('MM')
      checkWindowData.liveCheckStartYear = moment.utc().add(9, 'days').format('YYYY')
      const validationError = checkWindowAddValidator.validate(checkWindowData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.errors.liveCheckStartDateAfterLiveCheckEndDate).toBeTruthy()
      expect(validationError.errors.liveCheckEndDateBeforeLiveCheckStartDate).toBeTruthy()
    })
    test('calls addError with liveCheckEndDateBeforeAdminStartDate if the live check end day is before admin start date', () => {
      checkWindowData.liveCheckEndDay = moment.utc().format('DD')
      checkWindowData.liveCheckEndMonth = moment.utc().format('MM')
      checkWindowData.liveCheckEndYear = moment.utc().format('YYYY')
      const validationError = checkWindowAddValidator.validate(checkWindowData)
      expect(validationError.hasError()).toBeTruthy()
      expect(validationError.errors.liveCheckEndDateBeforeAdminStartDate).toBeTruthy()
    })
    test('does not call addError if all dates are on the same date', () => {
      checkWindowData.adminStartDay = moment.utc().format('DD')
      checkWindowData.adminStartMonth = moment.utc().format('MM')
      checkWindowData.adminStartYear = moment.utc().format('YYYY')
      checkWindowData.adminEndDay = moment.utc().format('DD')
      checkWindowData.adminEndMonth = moment.utc().format('MM')
      checkWindowData.adminEndYear = moment.utc().format('YYYY')
      checkWindowData.familiarisationCheckStartDay = moment.utc().format('DD')
      checkWindowData.familiarisationCheckStartMonth = moment.utc().format('MM')
      checkWindowData.familiarisationCheckStartYear = moment.utc().format('YYYY')
      checkWindowData.familiarisationCheckEndDay = moment.utc().format('DD')
      checkWindowData.familiarisationCheckEndMonth = moment.utc().format('MM')
      checkWindowData.familiarisationCheckEndYear = moment.utc().format('YYYY')
      checkWindowData.liveCheckStartDay = moment.utc().format('DD')
      checkWindowData.liveCheckStartMonth = moment.utc().format('MM')
      checkWindowData.liveCheckStartYear = moment.utc().format('YYYY')
      checkWindowData.liveCheckEndDay = moment.utc().format('DD')
      checkWindowData.liveCheckEndMonth = moment.utc().format('MM')
      checkWindowData.liveCheckEndYear = moment.utc().format('YYYY')
      const validationError = checkWindowAddValidator.validate(checkWindowData)
      expect(validationError.hasError()).toBeFalsy()
    })
    test('calls addError with familiarisationCheckEndDateNotEqualLiveCheckEndDate if the familiarisation check end day is not equal to live check end date', () => {
      checkWindowData.liveCheckEndDay = moment.utc().add(6, 'days').format('DD')
      checkWindowData.liveCheckEndMonth = moment.utc().add(6, 'days').format('MM')
      checkWindowData.liveCheckEndYear = moment.utc().add(6, 'days').format('YYYY')
      const validationError = checkWindowAddValidator.validate(checkWindowData)
      expect(validationError.hasError()).toBeTruthy()
      expect(Object.keys(validationError.errors).length).toBe(2)
      expect(validationError.errors.familiarisationCheckEndDateNotEqualLiveCheckEndDate).toBeTruthy()
      expect(validationError.errors.liveCheckEndDateNotEqualFamiliarisationCheckEndDate).toBeTruthy()
    })
    test('should not call createUTCFromDayMonthYear and dateValidator validate methods if adminStartDateDisabled', () => {
      jest.spyOn(dateService, 'createUTCFromDayMonthYear').mockImplementation()
      const validationConfig = {
        adminStartDateDisabled: true,
        adminEndDateDisabled: false,
        familiarisationCheckStartDateDisabled: false,
        familiarisationCheckEndDateDisabled: false,
        liveCheckStartDateDisabled: false,
        liveCheckEndDateDisabled: false
      }
      checkWindowAddValidator.validate(checkWindowData, validationConfig)
      expect(dateService.createUTCFromDayMonthYear).toHaveBeenCalledTimes(5)
      expect(dateValidator.validate).toHaveBeenCalledTimes(5)
    })
    test('should not call createUTCFromDayMonthYear and dateValidator validate methods if adminEndDateDisabled', () => {
      jest.spyOn(dateService, 'createUTCFromDayMonthYear').mockImplementation()
      const validationConfig = {
        adminStartDateDisabled: false,
        adminEndDateDisabled: true,
        familiarisationCheckStartDateDisabled: false,
        familiarisationCheckEndDateDisabled: false,
        liveCheckStartDateDisabled: false,
        liveCheckEndDateDisabled: false
      }
      checkWindowAddValidator.validate(checkWindowData, validationConfig)
      expect(dateService.createUTCFromDayMonthYear).toHaveBeenCalledTimes(5)
      expect(dateValidator.validate).toHaveBeenCalledTimes(5)
    })
    test('should not call createUTCFromDayMonthYear and dateValidator validate methods if familiarisationCheckStartDateDisabled', () => {
      jest.spyOn(dateService, 'createUTCFromDayMonthYear').mockImplementation()
      const validationConfig = {
        adminStartDateDisabled: false,
        adminEndDateDisabled: false,
        familiarisationCheckStartDateDisabled: true,
        familiarisationCheckEndDateDisabled: false,
        liveCheckStartDateDisabled: false,
        liveCheckEndDateDisabled: false
      }
      checkWindowAddValidator.validate(checkWindowData, validationConfig)
      expect(dateService.createUTCFromDayMonthYear).toHaveBeenCalledTimes(5)
      expect(dateValidator.validate).toHaveBeenCalledTimes(5)
    })
    test('should not call createUTCFromDayMonthYear and dateValidator validate methods if familiarisationCheckEndDateDisabled', () => {
      jest.spyOn(dateService, 'createUTCFromDayMonthYear').mockImplementation()
      const validationConfig = {
        adminStartDateDisabled: false,
        adminEndDateDisabled: false,
        familiarisationCheckStartDateDisabled: false,
        familiarisationCheckEndDateDisabled: true,
        liveCheckStartDateDisabled: false,
        liveCheckEndDateDisabled: false
      }
      checkWindowAddValidator.validate(checkWindowData, validationConfig)
      expect(dateService.createUTCFromDayMonthYear).toHaveBeenCalledTimes(5)
      expect(dateValidator.validate).toHaveBeenCalledTimes(5)
    })
    test('should not call createUTCFromDayMonthYear and dateValidator validate methods if liveCheckStartDateDisabled', () => {
      jest.spyOn(dateService, 'createUTCFromDayMonthYear').mockImplementation()
      const validationConfig = {
        adminStartDateDisabled: false,
        adminEndDateDisabled: false,
        familiarisationCheckStartDateDisabled: false,
        familiarisationCheckEndDateDisabled: false,
        liveCheckStartDateDisabled: true,
        liveCheckEndDateDisabled: false
      }
      checkWindowAddValidator.validate(checkWindowData, validationConfig)
      expect(dateService.createUTCFromDayMonthYear).toHaveBeenCalledTimes(5)
      expect(dateValidator.validate).toHaveBeenCalledTimes(5)
    })
    test('should not call createUTCFromDayMonthYear and dateValidator validate methods if liveCheckEndDateDisabled', () => {
      jest.spyOn(dateService, 'createUTCFromDayMonthYear').mockImplementation()
      const validationConfig = {
        adminStartDateDisabled: false,
        adminEndDateDisabled: false,
        familiarisationCheckStartDateDisabled: false,
        familiarisationCheckEndDateDisabled: false,
        liveCheckStartDateDisabled: false,
        liveCheckEndDateDisabled: true
      }
      checkWindowAddValidator.validate(checkWindowData, validationConfig)
      expect(dateService.createUTCFromDayMonthYear).toHaveBeenCalledTimes(5)
      expect(dateValidator.validate).toHaveBeenCalledTimes(5)
    })
  })

  describe('the service manager can close the checkWindow to a date in the past', () => {
    test('should raise a warning when setting the dates in the past when editing an existing checkWindow', () => {
      // Test data notes: we can't use a previous year because another rule will flag that as illegal.
      // At the start of the year, 1 Jan, we don't have enough days to set up a valid test.
      // So, we will have to modify the external clock.
      jest.useFakeTimers('modern')
      jest.setSystemTime(moment('2021-12-25T09:00:00').toDate())
      checkWindowData = {
        adminStartDay: '01',
        adminStartMonth: '12',
        adminStartYear: '2017',
        adminEndDay: '01',
        adminEndMonth: '03',
        adminEndYear: '2021',
        familiarisationCheckStartDay: '22',
        familiarisationCheckStartMonth: '11',
        familiarisationCheckStartYear: '2017',
        familiarisationCheckEndDay: '01',
        familiarisationCheckEndMonth: '03',
        familiarisationCheckEndYear: '2021',
        liveCheckStartDay: '22',
        liveCheckStartMonth: '12',
        liveCheckStartYear: '2017',
        liveCheckEndDay: '01',
        liveCheckEndMonth: '03',
        liveCheckEndYear: '2021',
        checkWindowName: 'test'
      }
      const validationConfig = {
        adminStartDateDisabled: true,
        adminEndDateDisabled: false,
        familiarisationCheckStartDateDisabled: true,
        familiarisationCheckEndDateDisabled: false,
        liveCheckStartDateDisabled: true,
        liveCheckEndDateDisabled: false
      }
      const validationError = checkWindowAddValidator.validate(checkWindowData, validationConfig)
      expect(validationError.hasError()).toBe(false)
      expect(validationError.hasWarning()).toBe(true)
      jest.useRealTimers()
      jest.restoreAllMocks()
    })
  })
})
