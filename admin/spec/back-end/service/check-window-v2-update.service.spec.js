'use strict'

const moment = require('moment')
const { v4: uuidv4 } = require('uuid')

const activeCheckWindowValidator = require('../../../lib/validator/check-window-v2/active-check-window-validator')
const checkWindowDataService = require('../../../services/data-access/check-window.data.service')
const checkWindowAddValidator = require('../../../lib/validator/check-window-v2/check-window-add-validator')
const checkWindowV2UpdateService = require('../../../services/check-window-v2-update.service')
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const ValidationError = require('../../../lib/validation-error')

describe('check-window-v2-update.service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('submit', () => {
    beforeEach(() => {
      jest.spyOn(checkWindowDataService, 'sqlFindActiveCheckWindow').mockReturnValue({ id: 1 })
    })
    test('when validation is successful should process data and perform db record update', async () => {
      const validationError = new ValidationError()
      jest.spyOn(checkWindowAddValidator, 'validate').mockReturnValue(validationError)
      jest.spyOn(checkWindowV2Service, 'prepareSubmissionData').mockReturnValue({ name: 'Check window' })
      jest.spyOn(activeCheckWindowValidator, 'validate').mockReturnValue(validationError)
      jest.spyOn(checkWindowDataService, 'sqlUpdate').mockImplementation()
      jest.spyOn(checkWindowV2UpdateService, 'getValidationConfig').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getCheckWindow').mockResolvedValue({ id: 1, checkWindowUrlSlug: uuidv4() })
      const requestData = {}
      await checkWindowV2UpdateService.submit(requestData)
      expect(checkWindowAddValidator.validate).toHaveBeenCalled()
      expect(checkWindowV2UpdateService.getValidationConfig).toHaveBeenCalled()
      expect(checkWindowV2Service.prepareSubmissionData).toHaveBeenCalled()
      expect(checkWindowV2Service.getCheckWindow).toHaveBeenCalled()
      expect(activeCheckWindowValidator.validate).toHaveBeenCalled()
      expect(checkWindowDataService.sqlUpdate).toHaveBeenCalled()
    })
    test('when checkWindowAddValidator validation is unsuccessful should throw a validation error', async () => {
      const validationError = new ValidationError()
      validationError.addError('errorField', true)
      jest.spyOn(checkWindowAddValidator, 'validate').mockReturnValue(validationError)
      jest.spyOn(checkWindowV2Service, 'prepareSubmissionData').mockImplementation()
      jest.spyOn(activeCheckWindowValidator, 'validate').mockImplementation()
      jest.spyOn(checkWindowV2UpdateService, 'getValidationConfig').mockImplementation()
      jest.spyOn(checkWindowDataService, 'sqlUpdate').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getCheckWindow').mockImplementation()
      const requestData = {}
      await expect(checkWindowV2UpdateService.submit(requestData))
        .rejects
        .toBeInstanceOf(ValidationError)
      expect(checkWindowAddValidator.validate).toHaveBeenCalled()
      expect(checkWindowV2Service.getCheckWindow).toHaveBeenCalled()
      expect(checkWindowV2UpdateService.getValidationConfig).toHaveBeenCalled()
      expect(checkWindowV2Service.prepareSubmissionData).not.toHaveBeenCalled()
      expect(checkWindowDataService.sqlUpdate).not.toHaveBeenCalled()
    })
    test('when checkWindowAddValidator validation is unsuccessful should not proceed with active check window validation', async () => {
      const validationError = new ValidationError()
      validationError.addError('errorField', true)
      jest.spyOn(checkWindowAddValidator, 'validate').mockReturnValue(validationError)
      jest.spyOn(checkWindowV2Service, 'prepareSubmissionData').mockImplementation()
      jest.spyOn(activeCheckWindowValidator, 'validate').mockImplementation()
      jest.spyOn(checkWindowV2UpdateService, 'getValidationConfig').mockImplementation()
      jest.spyOn(checkWindowDataService, 'sqlUpdate').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getCheckWindow').mockResolvedValue()
      const requestData = {}
      await expect(checkWindowV2UpdateService.submit(requestData))
        .rejects
        .toBeInstanceOf(ValidationError)
      expect(activeCheckWindowValidator.validate).not.toHaveBeenCalled()
    })
    test('when activeCheckWindowValidator validation is unsuccessful should throw a validation error and prevent sqlUpdate call', async () => {
      const validationError1 = new ValidationError()
      const validationError2 = new ValidationError()
      validationError2.addError('errorField', true)
      jest.spyOn(checkWindowAddValidator, 'validate').mockReturnValue(validationError1)
      jest.spyOn(checkWindowV2Service, 'prepareSubmissionData').mockReturnValue()
      jest.spyOn(activeCheckWindowValidator, 'validate').mockReturnValue(validationError2)
      jest.spyOn(checkWindowV2UpdateService, 'getValidationConfig').mockReturnValue()
      jest.spyOn(checkWindowDataService, 'sqlUpdate').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getCheckWindow').mockResolvedValue({ id: 1 })
      const requestData = { checkWindowUrlSlug: 'abc' }
      await expect(checkWindowV2UpdateService.submit(requestData))
        .rejects
        .toBeInstanceOf(ValidationError)
      expect(checkWindowDataService.sqlUpdate).not.toHaveBeenCalled()
    })
  })
  describe('getValidationConfig', () => {
    test('should return no disabled attributes if all dates are in the future back to the caller', () => {
      const checkWindow = {
        adminStartDate: moment.utc().add(1, 'days'),
        adminEndDate: moment.utc().add(10, 'days'),
        familiarisationCheckStartDate: moment.utc().add(2, 'days'),
        familiarisationCheckEndDate: moment.utc().add(4, 'days'),
        checkStartDate: moment.utc().add(3, 'days'),
        checkEndDate: moment.utc().add(4, 'days')
      }
      const result = checkWindowV2UpdateService.getValidationConfig(checkWindow)
      const config = {
        adminStartDateDisabled: false,
        adminEndDateDisabled: false,
        familiarisationCheckStartDateDisabled: false,
        familiarisationCheckEndDateDisabled: false,
        liveCheckStartDateDisabled: false,
        liveCheckEndDateDisabled: false
      }
      expect(result).toEqual(config)
    })
    test('should return no disabled attributes if all dates are set to the current date', () => {
      const checkWindow = {
        adminStartDate: moment.utc(),
        adminEndDate: moment.utc(),
        familiarisationCheckStartDate: moment.utc(),
        familiarisationCheckEndDate: moment.utc(),
        checkStartDate: moment.utc(),
        checkEndDate: moment.utc()
      }
      const result = checkWindowV2UpdateService.getValidationConfig(checkWindow)
      const config = {
        adminStartDateDisabled: false,
        adminEndDateDisabled: false,
        familiarisationCheckStartDateDisabled: false,
        familiarisationCheckEndDateDisabled: false,
        liveCheckStartDateDisabled: false,
        liveCheckEndDateDisabled: false
      }
      expect(result).toEqual(config)
    })
    test('should return a disabled attribute if it is in the past back to the caller', () => {
      const checkWindow = {
        adminStartDate: moment.utc().subtract(1, 'days'),
        adminEndDate: moment.utc().add(10, 'days'),
        familiarisationCheckStartDate: moment.utc().add(2, 'days'),
        familiarisationCheckEndDate: moment.utc().add(4, 'days'),
        checkStartDate: moment.utc().add(3, 'days'),
        checkEndDate: moment.utc().add(4, 'days')
      }
      const result = checkWindowV2UpdateService.getValidationConfig(checkWindow)
      const config = {
        adminStartDateDisabled: true,
        adminEndDateDisabled: false,
        familiarisationCheckStartDateDisabled: false,
        familiarisationCheckEndDateDisabled: false,
        liveCheckStartDateDisabled: false,
        liveCheckEndDateDisabled: false
      }
      expect(result).toEqual(config)
    })
  })
})
