'use strict'

/* global describe, beforeEach ,it, expect spyOn fail */
const administrationMessageDataService = require('../../../services/data-access/administration-message.data.service')
const redisCacheService = require('../../../services/data-access/redis-cache.service')
const administrationMessageService = require('../../../services/administration-message.service')
const emptyFieldsValidator = require('../../../lib/validator/common/empty-fields-validators')
const ValidationError = require('../../../lib/validation-error')

const serviceMessageRedisKey = 'serviceMessage'

describe('administrationMessageService', () => {
  describe('getMessage', () => {
    it('should call redis cache service to fetch the service message', async () => {
      spyOn(redisCacheService, 'get')
      spyOn(administrationMessageDataService, 'sqlFindActiveServiceMessage')
      await administrationMessageService.getMessage()
      expect(redisCacheService.get).toHaveBeenCalled()
    })
    it('should not call administrationMessageDataService.sqlFindActiveServiceMessage if service message is fetched from redis', async () => {
      spyOn(redisCacheService, 'get').and.returnValue(JSON.stringify({ title: 'title', message: 'message' }))
      spyOn(administrationMessageDataService, 'sqlFindActiveServiceMessage')
      await administrationMessageService.getMessage()
      expect(redisCacheService.get).toHaveBeenCalled()
      expect(administrationMessageDataService.sqlFindActiveServiceMessage).not.toHaveBeenCalled()
    })
    it('should call administrationMessageDataService.sqlFindActiveServiceMessage if redis service returns false while attempting to fetch the serviceMessage', async () => {
      spyOn(redisCacheService, 'get').and.returnValue(false)
      spyOn(administrationMessageDataService, 'sqlFindActiveServiceMessage')
      await administrationMessageService.getMessage()
      expect(redisCacheService.get).toHaveBeenCalled()
      expect(administrationMessageDataService.sqlFindActiveServiceMessage).toHaveBeenCalled()
    })
    it('should call administrationMessageDataService.sqlFindActiveServiceMessage if undefined is returned from redis service', async () => {
      spyOn(redisCacheService, 'get')
      spyOn(administrationMessageDataService, 'sqlFindActiveServiceMessage')
      await administrationMessageService.getMessage()
      expect(redisCacheService.get).toHaveBeenCalled()
      expect(administrationMessageDataService.sqlFindActiveServiceMessage).toHaveBeenCalled()
    })
  })
  describe('setMessage', () => {
    const serviceMessageTitle = 'serviceMessageTitle'
    const serviceMessageContent = 'serviceMessageContent'
    const requestData = { serviceMessageTitle, serviceMessageContent }
    beforeEach(() => {
      spyOn(administrationMessageService, 'prepareSubmissionData')
        .and.returnValue({ title: 'serviceMessageTitle', message: 'serviceMessageContent' })
      spyOn(administrationMessageDataService, 'sqlCreate')
      spyOn(redisCacheService, 'set')
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
      expect(redisCacheService.set).not.toHaveBeenCalled()
    })
    it('should call emptyFieldsValidator.validate', async () => {
      const validationError = new ValidationError()
      spyOn(emptyFieldsValidator, 'validate').and.returnValues(validationError)
      const userId = 1
      await administrationMessageService.setMessage(requestData, userId)
      expect(emptyFieldsValidator.validate).toHaveBeenCalled()
    })
    it('should not continue further if a validation error occurs', async () => {
      const validationError = new ValidationError()
      validationError.addError('serviceMessageTitle', 'error')
      spyOn(emptyFieldsValidator, 'validate').and.returnValues(validationError)
      const userId = 1
      await administrationMessageService.setMessage(requestData, userId)
      expect(emptyFieldsValidator.validate).toHaveBeenCalled()
      expect(administrationMessageService.prepareSubmissionData).not.toHaveBeenCalled()
      expect(administrationMessageDataService.sqlCreate).not.toHaveBeenCalled()
      expect(redisCacheService.set).not.toHaveBeenCalled()
    })
    it('should call administrationMessageDataService.sqlCreate', async () => {
      const validationError = new ValidationError()
      spyOn(emptyFieldsValidator, 'validate').and.returnValues(validationError)
      const userId = 1
      await administrationMessageService.setMessage(requestData, userId)
      expect(emptyFieldsValidator.validate).toHaveBeenCalled()
      expect(administrationMessageService.prepareSubmissionData).toHaveBeenCalled()
      expect(administrationMessageDataService.sqlCreate).toHaveBeenCalled()
    })
    it('should call redisCacheService.set after a successful database transmission', async () => {
      const validationError = new ValidationError()
      spyOn(emptyFieldsValidator, 'validate').and.returnValues(validationError)
      const userId = 1
      await administrationMessageService.setMessage(requestData, userId)
      expect(emptyFieldsValidator.validate).toHaveBeenCalled()
      expect(administrationMessageService.prepareSubmissionData).toHaveBeenCalled()
      expect(administrationMessageDataService.sqlCreate).toHaveBeenCalled()
      expect(redisCacheService.set).toHaveBeenCalledWith(serviceMessageRedisKey, { title: 'serviceMessageTitle', message: 'serviceMessageContent' })
    })
  })
  describe('prepareSubmissionData', () => {
    it('should return an object that includes title, message and createdByUser_id when creating a record', () => {
      const requestData = {
        serviceMessageTitle: 'serviceMessageTitle',
        serviceMessageContent: 'serviceMessageContent'
      }
      const userId = 1
      const result = administrationMessageService.prepareSubmissionData(requestData, userId)
      expect(result).toEqual({ createdByUser_id: 1, title: 'serviceMessageTitle', message: 'serviceMessageContent' })
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
      spyOn(redisCacheService, 'drop')
      await administrationMessageService.dropMessage(userId)
      expect(administrationMessageDataService.sqlDeleteServiceMessage).toHaveBeenCalled()
    })
    it('should not call redisCacheService.drop if administrationMessageDataService.sqlDeleteServiceMessage fails', async () => {
      const userId = 1
      spyOn(administrationMessageDataService, 'sqlDeleteServiceMessage').and.returnValue(Promise.reject(new Error('error')))
      spyOn(redisCacheService, 'drop')
      try {
        await administrationMessageService.dropMessage(userId)
        fail()
      } catch (ignore) {}
      expect(administrationMessageDataService.sqlDeleteServiceMessage).toHaveBeenCalled()
      expect(redisCacheService.drop).not.toHaveBeenCalled()
    })
    it('should call redisCacheService.drop if administrationMessageDataService.sqlDeleteServiceMessage is successful', async () => {
      const userId = 1
      spyOn(administrationMessageDataService, 'sqlDeleteServiceMessage')
      spyOn(redisCacheService, 'drop')
      await administrationMessageService.dropMessage(userId)
      expect(administrationMessageDataService.sqlDeleteServiceMessage).toHaveBeenCalled()
      expect(redisCacheService.drop).toHaveBeenCalledWith(serviceMessageRedisKey)
    })
  })
})
