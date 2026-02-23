'use strict'

const activeCheckWindowValidator = require('../../../lib/validator/check-window-v2/active-check-window-validator')
const checkWindowDataService = require('../../../services/data-access/check-window.data.service')
const checkWindowAddValidator = require('../../../lib/validator/check-window-v2/check-window-add-validator')
const checkWindowV2AddService = require('../../../services/check-window-v2-add.service')
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const ValidationError = require('../../../lib/validation-error')

describe('check-window-v2-add.service', () => {
  describe('submit', () => {
    beforeEach(() => {
      jest.spyOn(checkWindowDataService, 'sqlFindActiveCheckWindow').mockImplementation()
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    test('when validation is successful should process data and perform db insertion', async () => {
      const validationError = new ValidationError()
      jest.spyOn(checkWindowAddValidator, 'validate').mockReturnValue(validationError)
      jest.spyOn(checkWindowV2Service, 'prepareSubmissionData').mockReturnValue({ name: 'Check window' })
      jest.spyOn(activeCheckWindowValidator, 'validate').mockReturnValue(validationError)
      jest.spyOn(checkWindowDataService, 'sqlCreate').mockImplementation()
      const requestData = {}
      await expect(checkWindowV2AddService.submit(requestData)).resolves.not.toThrow()
      expect(checkWindowAddValidator.validate).toHaveBeenCalled()
      expect(checkWindowV2Service.prepareSubmissionData).toHaveBeenCalled()
      expect(activeCheckWindowValidator.validate).toHaveBeenCalled()
      expect(checkWindowDataService.sqlCreate).toHaveBeenCalled()
    })
    test('when checkWindowAddValidator validation is unsuccessful should throw a validation error', async () => {
      const validationError = new ValidationError()
      validationError.addError('errorField', true)
      jest.spyOn(checkWindowAddValidator, 'validate').mockReturnValue(validationError)
      jest.spyOn(checkWindowV2Service, 'prepareSubmissionData').mockImplementation()
      jest.spyOn(activeCheckWindowValidator, 'validate').mockReturnValue(validationError)
      jest.spyOn(checkWindowDataService, 'sqlCreate').mockImplementation()
      const requestData = {}
      await expect(checkWindowV2AddService.submit(requestData)).rejects.toBeInstanceOf(ValidationError)
      expect(checkWindowAddValidator.validate).toHaveBeenCalled()
      expect(checkWindowV2Service.prepareSubmissionData).not.toHaveBeenCalled()
      expect(checkWindowDataService.sqlCreate).not.toHaveBeenCalled()
    })
    test('when checkWindowAddValidator validation is unsuccessful should not proceed with active check window validation', async () => {
      const validationError = new ValidationError()
      validationError.addError('errorField', true)
      jest.spyOn(checkWindowAddValidator, 'validate').mockReturnValue(validationError)
      jest.spyOn(checkWindowV2Service, 'prepareSubmissionData').mockImplementation()
      jest.spyOn(activeCheckWindowValidator, 'validate').mockReturnValue(validationError)
      jest.spyOn(checkWindowDataService, 'sqlCreate').mockImplementation()
      const requestData = {}
      await expect(checkWindowV2AddService.submit(requestData)).rejects.toBeInstanceOf(ValidationError)
      expect(activeCheckWindowValidator.validate).not.toHaveBeenCalled()
    })
    test('when activeCheckWindowValidator validation is unsuccessful should throw a validation error and prevent sqlCreate call', async () => {
      const validationError1 = new ValidationError()
      const validationError2 = new ValidationError()
      validationError2.addError('errorField', true)
      jest.spyOn(checkWindowAddValidator, 'validate').mockReturnValue(validationError1)
      jest.spyOn(checkWindowV2Service, 'prepareSubmissionData').mockImplementation()
      jest.spyOn(activeCheckWindowValidator, 'validate').mockReturnValue(validationError2)
      jest.spyOn(checkWindowDataService, 'sqlCreate').mockImplementation()
      const requestData = {}
      await expect(checkWindowV2AddService.submit(requestData)).rejects.toBeInstanceOf(ValidationError)
      expect(activeCheckWindowValidator.validate).toHaveBeenCalled()
      expect(checkWindowDataService.sqlCreate).not.toHaveBeenCalled()
    })
  })
})
