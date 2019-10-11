'use strict'

/* global describe, beforeEach ,it, expect spyOn fail */
const administrationMessageDataService = require('../../../services/data-access/administration-message.data.service')
const administrationMessageService = require('../../../services/administration-message.service')
const emptyFieldsValidator = require('../../../lib/validator/common/empty-fields-validators')
const ValidationError = require('../../../lib/validation-error')

describe('administrationMessageService', () => {
  describe('getMessage', () => {
    it('should call administrationMessageDataService.sqlFindActiveServiceMessage', async () => {
      spyOn(administrationMessageDataService, 'sqlFindActiveServiceMessage')
      await administrationMessageService.getMessage()
      expect(administrationMessageDataService.sqlFindActiveServiceMessage).toHaveBeenCalled()
    })
  })
  describe('setMessage', () => {
    const serviceMessageTitle = 'serviceMessageTitle'
    const serviceMessageContent = 'serviceMessageContent'
    const requestData = { serviceMessageTitle, serviceMessageContent }
    beforeEach(() => {
      spyOn(administrationMessageService, 'prepareSubmissionData')
      spyOn(administrationMessageDataService, 'sqlCreate')
      spyOn(administrationMessageDataService, 'sqlUpdate')
    })
    it('should not continue further if a user id is not present', async () => {
      const validationError = new ValidationError()
      validationError.addError('serviceMessageTitle', 'error')
      spyOn(emptyFieldsValidator, 'validate').and.returnValues(validationError)
      const userId = undefined
      try {
        await administrationMessageService.setMessage(requestData, userId)
        fail()
      } catch (error) {
        expect(error.message).toBe('User id not found in session')
      }
      expect(emptyFieldsValidator.validate).not.toHaveBeenCalled()
      expect(administrationMessageService.prepareSubmissionData).not.toHaveBeenCalled()
      expect(administrationMessageDataService.sqlCreate).not.toHaveBeenCalled()
      expect(administrationMessageDataService.sqlUpdate).not.toHaveBeenCalled()
    })
    it('should call emptyFieldsValidator.validate', async () => {
      const validationError = new ValidationError()
      spyOn(emptyFieldsValidator, 'validate').and.returnValues(validationError)
      const userId = '1'
      await administrationMessageService.setMessage(requestData, userId)
      expect(emptyFieldsValidator.validate).toHaveBeenCalled()
    })
    it('should not continue further if a validation error occurs', async () => {
      const validationError = new ValidationError()
      validationError.addError('serviceMessageTitle', 'error')
      spyOn(emptyFieldsValidator, 'validate').and.returnValues(validationError)
      const userId = '1'
      await administrationMessageService.setMessage(requestData, userId)
      expect(emptyFieldsValidator.validate).toHaveBeenCalled()
      expect(administrationMessageService.prepareSubmissionData).not.toHaveBeenCalled()
      expect(administrationMessageDataService.sqlCreate).not.toHaveBeenCalled()
      expect(administrationMessageDataService.sqlUpdate).not.toHaveBeenCalled()
    })
    it('should call administrationMessageDataService.sqlCreate if not in edit mode', async () => {
      const validationError = new ValidationError()
      spyOn(emptyFieldsValidator, 'validate').and.returnValues(validationError)
      const userId = '1'
      requestData.isEditView = undefined
      await administrationMessageService.setMessage(requestData, userId)
      expect(emptyFieldsValidator.validate).toHaveBeenCalled()
      expect(administrationMessageService.prepareSubmissionData).toHaveBeenCalled()
      expect(administrationMessageDataService.sqlCreate).toHaveBeenCalled()
      expect(administrationMessageDataService.sqlUpdate).not.toHaveBeenCalled()
    })
    it('should call administrationMessageDataService.sqlUpdate if in edit mode', async () => {
      const validationError = new ValidationError()
      spyOn(emptyFieldsValidator, 'validate').and.returnValues(validationError)
      const userId = '1'
      requestData.isEditView = true
      await administrationMessageService.setMessage(requestData, userId)
      expect(emptyFieldsValidator.validate).toHaveBeenCalled()
      expect(administrationMessageService.prepareSubmissionData).toHaveBeenCalled()
      expect(administrationMessageDataService.sqlCreate).not.toHaveBeenCalled()
      expect(administrationMessageDataService.sqlUpdate).toHaveBeenCalled()
    })
  })
  describe('prepareSubmissionData', () => {
    it('should return an object that includes title, message and recordedByUser_id when creating a record', () => {
      const requestData = {
        serviceMessageTitle: 'serviceMessageTitle',
        serviceMessageContent: 'serviceMessageContent'
      }
      const userId = 1
      const result = administrationMessageService.prepareSubmissionData(requestData, userId)
      expect(result).toEqual({ recordedByUser_id: 1, title: 'serviceMessageTitle', message: 'serviceMessageContent' })
    })
    it('should return an object that includes title, message and updatedByUser_id when creating a record', () => {
      const requestData = {
        isEditView: true,
        serviceMessageTitle: 'serviceMessageTitle',
        serviceMessageContent: 'serviceMessageContent'
      }
      const userId = 1
      const result = administrationMessageService.prepareSubmissionData(requestData, userId)
      expect(result).toEqual({ updatedByUser_id: 1, title: 'serviceMessageTitle', message: 'serviceMessageContent' })
    })
  })
  describe('dropMessage', () => {
    it('should not continue further if a user id is not present', async () => {
      spyOn(administrationMessageDataService, 'sqlDeleteServiceMessage')
      try {
        await administrationMessageService.dropMessage()
        fail()
      } catch (error) {
        expect(error.message).toBe('User id not found in session')
        expect(administrationMessageDataService.sqlDeleteServiceMessage).not.toHaveBeenCalled()
      }
    })
    it('should call administrationMessageDataService.sqlDeleteServiceMessage if user id is present', async () => {
      const userId = 1
      spyOn(administrationMessageDataService, 'sqlDeleteServiceMessage')
      await administrationMessageService.dropMessage(userId)
      expect(administrationMessageDataService.sqlDeleteServiceMessage).toHaveBeenCalled()
    })
  })
})
