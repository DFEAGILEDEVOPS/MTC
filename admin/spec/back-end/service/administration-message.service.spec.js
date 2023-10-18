'use strict'

/* global describe, beforeEach expect test jest afterEach */
const administrationMessageDataService = require('../../../services/data-access/administration-message.data.service')
const redisCacheService = require('../../../services/data-access/redis-cache.service')
const administrationMessageService = require('../../../services/administration-message.service')
const emptyFieldsValidator = require('../../../lib/validator/common/empty-fields-validators')
const ValidationError = require('../../../lib/validation-error')
const { marked } = require('marked')

const serviceMessageRedisKey = 'serviceMessage'

describe('administrationMessageService', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getMessage', () => {
    test('should call redis cache service to fetch the service message', async () => {
      jest.spyOn(redisCacheService, 'get').mockImplementation()
      jest.spyOn(administrationMessageDataService, 'sqlFindActiveServiceMessage').mockImplementation()
      await administrationMessageService.getMessage()
      expect(redisCacheService.get).toHaveBeenCalled()
    })

    test('should not call administrationMessageDataService.sqlFindActiveServiceMessage if service message is fetched from redis', async () => {
      jest.spyOn(redisCacheService, 'get').mockResolvedValue(JSON.stringify({ title: 'title', message: 'message' }))
      jest.spyOn(administrationMessageDataService, 'sqlFindActiveServiceMessage').mockImplementation()
      await administrationMessageService.getMessage()
      expect(redisCacheService.get).toHaveBeenCalled()
      expect(administrationMessageDataService.sqlFindActiveServiceMessage).not.toHaveBeenCalled()
    })

    test('should call administrationMessageDataService.sqlFindActiveServiceMessage if redis service returns false while attempting to fetch the serviceMessage', async () => {
      jest.spyOn(redisCacheService, 'get').mockResolvedValue(false)
      jest.spyOn(administrationMessageDataService, 'sqlFindActiveServiceMessage').mockImplementation()
      await administrationMessageService.getMessage()
      expect(redisCacheService.get).toHaveBeenCalled()
      expect(administrationMessageDataService.sqlFindActiveServiceMessage).toHaveBeenCalled()
    })

    test('should call administrationMessageDataService.sqlFindActiveServiceMessage if undefined is returned from redis service', async () => {
      jest.spyOn(redisCacheService, 'get').mockImplementation()
      jest.spyOn(administrationMessageDataService, 'sqlFindActiveServiceMessage').mockImplementation()
      await administrationMessageService.getMessage()
      expect(redisCacheService.get).toHaveBeenCalled()
      expect(administrationMessageDataService.sqlFindActiveServiceMessage).toHaveBeenCalled()
    })

    test('should convert the markdown to html', async () => {
      jest.spyOn(redisCacheService, 'get').mockResolvedValue(JSON.stringify({ title: 'title', message: '# title\n**bold** *italic*' }))
      const msg = await administrationMessageService.getMessage()
      expect(msg.message).toContain('<h1>title</h1>')
      expect(msg.message).toContain('<strong>bold</strong>')
      expect(msg.message).toContain('<em>italic</em>')
    })

    test('it returns undefined if the markdown parser throws an error', async () => {
      jest.spyOn(administrationMessageService, 'fetchMessage').mockResolvedValue({ title: 'test', message: 'some unparsable content' })
      jest.spyOn(marked, 'parse').mockImplementation(() => { throw new Error('test error') })
      await expect(administrationMessageService.getMessage()).resolves.toBeUndefined()
    })
  })

  describe('setMessage', () => {
    const serviceMessageTitle = 'serviceMessageTitle'
    const serviceMessageContent = 'serviceMessageContent'
    const areaCode = ['H', 'P']
    const requestData = { serviceMessageTitle, serviceMessageContent, areaCode }

    beforeEach(() => {
      jest.spyOn(administrationMessageService, 'prepareSubmissionData')
        .mockReturnValue({ title: 'serviceMessageTitle', message: 'serviceMessageContent' })
      jest.spyOn(administrationMessageDataService, 'sqlCreateOrUpdate').mockImplementation()
      jest.spyOn(redisCacheService, 'set').mockImplementation()
      // jest.spyOn()// make areaCodeService static so we can spy
    })

    test('should not continue further if a user id is not present', async () => {
      const validationError = new ValidationError()
      validationError.addError('serviceMessageTitle', 'error')
      jest.spyOn(emptyFieldsValidator, 'validate').mockReturnValue(validationError)
      const userId = undefined
      await expect(administrationMessageService.setMessage(requestData, userId)).rejects.toThrow('User id not found in session')
      expect(emptyFieldsValidator.validate).not.toHaveBeenCalled()
      expect(administrationMessageService.prepareSubmissionData).not.toHaveBeenCalled()
      expect(administrationMessageDataService.sqlCreateOrUpdate).not.toHaveBeenCalled()
      expect(redisCacheService.set).not.toHaveBeenCalled()
    })

    test('should call emptyFieldsValidator.validate', async () => {
      const validationError = new ValidationError()
      jest.spyOn(emptyFieldsValidator, 'validate').mockReturnValue(validationError)
      const userId = 1
      await administrationMessageService.setMessage(requestData, userId)
      expect(emptyFieldsValidator.validate).toHaveBeenCalled()
    })

    test('should not continue further if a validation error occurs', async () => {
      const validationError = new ValidationError()
      validationError.addError('serviceMessageTitle', 'error')
      jest.spyOn(emptyFieldsValidator, 'validate').mockReturnValue(validationError)
      const userId = 1
      await administrationMessageService.setMessage(requestData, userId)
      expect(emptyFieldsValidator.validate).toHaveBeenCalled()
      expect(administrationMessageService.prepareSubmissionData).not.toHaveBeenCalled()
      expect(administrationMessageDataService.sqlCreateOrUpdate).not.toHaveBeenCalled()
      expect(redisCacheService.set).not.toHaveBeenCalled()
    })

    test('should call administrationMessageDataService.sqlCreateOrUpdate', async () => {
      const validationError = new ValidationError()
      jest.spyOn(emptyFieldsValidator, 'validate').mockReturnValue(validationError)
      const userId = 1
      await administrationMessageService.setMessage(requestData, userId)
      expect(emptyFieldsValidator.validate).toHaveBeenCalled()
      expect(administrationMessageService.prepareSubmissionData).toHaveBeenCalled()
      expect(administrationMessageDataService.sqlCreateOrUpdate).toHaveBeenCalled()
    })

    test('should call redisCacheService.set after a successful database transmission', async () => {
      const validationError = new ValidationError()
      jest.spyOn(emptyFieldsValidator, 'validate').mockReturnValue(validationError)
      const userId = 1
      await administrationMessageService.setMessage(requestData, userId)
      expect(emptyFieldsValidator.validate).toHaveBeenCalled()
      expect(administrationMessageService.prepareSubmissionData).toHaveBeenCalled()
      expect(administrationMessageDataService.sqlCreateOrUpdate).toHaveBeenCalled()
      expect(redisCacheService.set).toHaveBeenCalledWith(serviceMessageRedisKey, { title: 'serviceMessageTitle', message: 'serviceMessageContent' })
    })
  })

  describe('prepareSubmissionData', () => {
    const areaCode = ['H', 'P']
    test('should return an object that includes title, message and createdByUser_id when creating a record', () => {
      const requestData = {
        serviceMessageTitle: 'serviceMessageTitle',
        serviceMessageContent: 'serviceMessageContent',
        areaCode,
        borderColourCode: 'B'
      }
      const userId = 1
      const result = administrationMessageService.prepareSubmissionData(requestData, userId)
      expect(result).toMatchObject({ createdByUser_id: 1, title: 'serviceMessageTitle', message: 'serviceMessageContent', areaCode: ['H', 'P'], borderColourCode: 'B' })
    })

    test('should return an object that includes title, message and id and createdByUser_id when editing a record', () => {
      const requestData = {
        serviceMessageTitle: 'serviceMessageTitle',
        serviceMessageContent: 'serviceMessageContent',
        id: '1',
        areaCode
      }
      const userId = 1
      const result = administrationMessageService.prepareSubmissionData(requestData, userId)
      expect(result).toMatchObject({ createdByUser_id: 1, title: 'serviceMessageTitle', message: 'serviceMessageContent', id: '1', areaCode: ['H', 'P'] })
    })
  })

  describe('dropMessage', () => {
    test('should not continue further if a user id is not present', async () => {
      jest.spyOn(administrationMessageDataService, 'sqlDeleteServiceMessage').mockImplementation()
      await expect(administrationMessageService.dropMessage()).rejects.toThrow('User id not found in session')
      expect(administrationMessageDataService.sqlDeleteServiceMessage).not.toHaveBeenCalled()
    })

    test('should call administrationMessageDataService.sqlDeleteServiceMessage if user id is present', async () => {
      const userId = 1
      jest.spyOn(administrationMessageDataService, 'sqlDeleteServiceMessage').mockImplementation()
      jest.spyOn(redisCacheService, 'drop').mockImplementation()
      await administrationMessageService.dropMessage(userId)
      expect(administrationMessageDataService.sqlDeleteServiceMessage).toHaveBeenCalled()
    })

    test('should not call redisCacheService.drop if administrationMessageDataService.sqlDeleteServiceMessage fails', async () => {
      const userId = 1
      jest.spyOn(administrationMessageDataService, 'sqlDeleteServiceMessage').mockRejectedValue(new Error('error'))
      jest.spyOn(redisCacheService, 'drop').mockImplementation()
      await expect(administrationMessageService.dropMessage(userId)).rejects.toThrow('error')
      expect(administrationMessageDataService.sqlDeleteServiceMessage).toHaveBeenCalled()
      expect(redisCacheService.drop).not.toHaveBeenCalled()
    })

    test('should call redisCacheService.drop if administrationMessageDataService.sqlDeleteServiceMessage is successful', async () => {
      const userId = 1
      jest.spyOn(administrationMessageDataService, 'sqlDeleteServiceMessage').mockImplementation()
      jest.spyOn(redisCacheService, 'drop').mockImplementation()
      await administrationMessageService.dropMessage(userId)
      expect(administrationMessageDataService.sqlDeleteServiceMessage).toHaveBeenCalled()
      expect(redisCacheService.drop).toHaveBeenCalledWith(serviceMessageRedisKey)
    })
  })
})
