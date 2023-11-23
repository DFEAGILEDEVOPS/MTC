'use strict'

/* global describe, beforeEach expect test jest afterEach */
const administrationMessageDataService = require('../../../services/data-access/administration-message.data.service')
const redisCacheService = require('../../../services/data-access/redis-cache.service')
const administrationMessageService = require('../../../services/administration-message.service')
const ValidationError = require('../../../lib/validation-error')
const { marked } = require('marked')
const { ServiceMessageCodesService } = require('../../../services/service-message/service-message.service')
const { ServiceMessageValidator } = require('../../../services/service-message/service-message.validator')

const serviceMessageRedisKey = 'serviceMessage'

describe('administrationMessageService', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getMessages', () => {
    const mockServiceMessages = [
      {
        title: 'title 1',
        message: 'message 1',
        borderColourCode: 'B',
        areaCodes: ['A', 'P'],
        urlSlug: 'abc-defe'
      },
      {
        title: 'Global message',
        message: '# title\n**bold** *italic*',
        borderColourCode: 'G',
        areaCodes: ['A', 'B', 'C'],
        urlSlug: 'def-hij'
      }
    ]

    beforeEach(() => {
      jest.spyOn(administrationMessageDataService, 'sqlFindServiceMessages').mockImplementation()
      jest.spyOn(redisCacheService, 'get').mockImplementation()
      jest.spyOn(redisCacheService, 'set').mockImplementation()
    })

    test('should call redis cache service to fetch the service message', async () => {
      await administrationMessageService.getMessages()
      expect(redisCacheService.get).toHaveBeenCalled()
    })

    test('should not call administrationMessageDataService.sqlFindServiceMessages if service message is fetched from redis', async () => {
      jest.spyOn(redisCacheService, 'get').mockResolvedValue(JSON.stringify(mockServiceMessages))
      await administrationMessageService.getMessages()
      expect(redisCacheService.get).toHaveBeenCalled()
      expect(administrationMessageDataService.sqlFindServiceMessages).not.toHaveBeenCalled()
    })

    test('should call administrationMessageDataService.sqlFindServiceMessages if redis service returns false while attempting to fetch the serviceMessage', async () => {
      jest.spyOn(redisCacheService, 'get').mockResolvedValue(false)
      await administrationMessageService.getMessages()
      expect(redisCacheService.get).toHaveBeenCalled()
      expect(administrationMessageDataService.sqlFindServiceMessages).toHaveBeenCalled()
    })

    test('should call administrationMessageDataService.sqlFindServiceMessages if undefined is returned from redis service', async () => {
      jest.spyOn(redisCacheService, 'get').mockResolvedValue(undefined)
      await administrationMessageService.getMessages()
      expect(redisCacheService.get).toHaveBeenCalled()
      expect(administrationMessageDataService.sqlFindServiceMessages).toHaveBeenCalled()
    })

    test('should convert the markdown to html', async () => {
      jest.spyOn(redisCacheService, 'get').mockResolvedValue(undefined)
      jest.spyOn(administrationMessageDataService, 'sqlFindServiceMessages').mockResolvedValue(mockServiceMessages)
      const msgs = await administrationMessageService.getMessages()
      expect(msgs[1].message).toContain('<h1>title</h1>')
      expect(msgs[1].message).toContain('<strong>bold</strong>')
      expect(msgs[1].message).toContain('<em>italic</em>')
    })

    test('it returns undefined if the markdown parser throws an error', async () => {
      jest.spyOn(administrationMessageDataService, 'sqlFindServiceMessages').mockResolvedValue([{ title: 'test', message: 'some unparsable content' }])
      jest.spyOn(marked, 'parse').mockImplementation(() => { throw new Error('test error') })
      await expect(administrationMessageService.getMessages()).resolves.toBeUndefined()
    })
  })

  describe('setMessage', () => {
    const serviceMessageTitle = 'serviceMessageTitle'
    const serviceMessageContent = 'serviceMessageContent'
    const areaCode = ['H', 'P']
    const requestData = { serviceMessageTitle, serviceMessageContent, areaCode }

    beforeEach(() => {
      jest.spyOn(administrationMessageService, 'prepareSubmissionData')
        .mockReturnValue(
          { title: 'serviceMessageTitle', message: 'serviceMessageContent', borderColour: 'B', areaCode: ['A', 'B'] }
        )
      jest.spyOn(administrationMessageDataService, 'sqlCreateOrUpdate').mockImplementation()
      jest.spyOn(redisCacheService, 'drop').mockImplementation()
      jest.spyOn(ServiceMessageCodesService, 'getAreaCodes').mockResolvedValue([
        { code: 'A', description: 'A Test code' },
        { code: 'B', description: 'B Test code' },
        { code: 'C', description: 'C Test code' }
      ])
      jest.spyOn(ServiceMessageCodesService, 'getBorderColourCodes').mockResolvedValue([
        { code: 'D', description: 'D Test code' },
        { code: 'E', description: 'E Test code' },
        { code: 'F', description: 'F Test code' }
      ])
      jest.spyOn(ServiceMessageValidator, 'validate').mockImplementation()
    })

    test('should not continue further if a user id is not present', async () => {
      const validationError = new ValidationError()
      validationError.addError('serviceMessageTitle', 'error')
      jest.spyOn(ServiceMessageValidator, 'validate').mockReturnValue(validationError)
      const userId = undefined
      await expect(administrationMessageService.setMessage(requestData, userId)).rejects.toThrow('User id not found in session')
      expect(ServiceMessageValidator.validate).not.toHaveBeenCalled()
      expect(administrationMessageService.prepareSubmissionData).not.toHaveBeenCalled()
      expect(administrationMessageDataService.sqlCreateOrUpdate).not.toHaveBeenCalled()
      expect(redisCacheService.drop).not.toHaveBeenCalled()
    })

    test('should call call the validator', async () => {
      const validationError = new ValidationError()
      jest.spyOn(ServiceMessageValidator, 'validate').mockReturnValue(validationError)
      const userId = 1
      await administrationMessageService.setMessage(requestData, userId)
      expect(ServiceMessageValidator.validate).toHaveBeenCalled()
    })

    test('should not continue further if a validation error occurs', async () => {
      const validationError = new ValidationError()
      validationError.addError('serviceMessageTitle', 'error')
      jest.spyOn(ServiceMessageValidator, 'validate').mockReturnValue(validationError)
      const userId = 1
      await administrationMessageService.setMessage(requestData, userId)
      expect(ServiceMessageValidator.validate).toHaveBeenCalled()
      expect(administrationMessageService.prepareSubmissionData).not.toHaveBeenCalled()
      expect(administrationMessageDataService.sqlCreateOrUpdate).not.toHaveBeenCalled()
    })

    test('should call administrationMessageDataService.sqlCreateOrUpdate', async () => {
      const validationError = new ValidationError()
      jest.spyOn(ServiceMessageValidator, 'validate').mockReturnValue(validationError)
      const userId = 1
      await administrationMessageService.setMessage(requestData, userId)
      expect(ServiceMessageValidator.validate).toHaveBeenCalled()
      expect(administrationMessageService.prepareSubmissionData).toHaveBeenCalled()
      expect(administrationMessageDataService.sqlCreateOrUpdate).toHaveBeenCalled()
    })

    test('should call redisCacheService.drop after creating or editing a message', async () => {
      const validationError = new ValidationError()
      jest.spyOn(ServiceMessageValidator, 'validate').mockReturnValue(validationError)
      const userId = 1
      await administrationMessageService.setMessage(requestData, userId)
      expect(ServiceMessageValidator.validate).toHaveBeenCalled()
      expect(administrationMessageService.prepareSubmissionData).toHaveBeenCalled()
      expect(administrationMessageDataService.sqlCreateOrUpdate).toHaveBeenCalled()
      expect(redisCacheService.drop).toHaveBeenCalledWith(serviceMessageRedisKey)
    })
  })

  describe('prepareSubmissionData', () => {
    let serviceMessageInput

    beforeEach(() => {
      const areaCode = ['A', 'B']
      serviceMessageInput = {
        serviceMessageTitle: { fieldKey: 'serviceMessageTitle', fieldValue: 'title', errorMessage: 'title error' },
        serviceMessageContent: { fieldKey: 'serviceMessageContent', fieldValue: 'content', errorMessage: 'content error' },
        borderColourCode: { fieldKey: 'borderColourCode', fieldValue: 'B', errorMessage: 'borderColourCode error', allowedValues: ['B', 'Z'] },
        areaCode: { fieldKey: 'areaCode', fieldValue: areaCode, errorMessage: 'areaCode error', allowedValues: ['A', 'B', 'C'] }
      }
    })

    test('should return an object that includes title, message and createdByUser_id when creating a record', () => {
      const userId = 1
      const result = administrationMessageService.prepareSubmissionData(serviceMessageInput, userId)
      expect(result).toMatchObject({
        createdByUser_id: 1,
        title: 'title',
        message: 'content',
        areaCode: ['A', 'B'],
        borderColourCode: 'B'
      })
    })

    test('should return an object that includes title, message, urlSlug and createdByUser_id when editing a record', () => {
      serviceMessageInput.urlSlug = 'edea6edf-91c2-4749-8500-24fdf202e871' // add urlSlug for the edit
      const userId = 1
      const result = administrationMessageService.prepareSubmissionData(serviceMessageInput, userId)
      expect(result).toMatchObject({
        createdByUser_id: 1,
        title: 'title',
        message: 'content',
        areaCode: ['A', 'B'],
        urlSlug: 'edea6edf-91c2-4749-8500-24fdf202e871'
      })
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
