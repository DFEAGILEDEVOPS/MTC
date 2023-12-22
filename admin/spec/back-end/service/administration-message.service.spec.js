'use strict'

/* global describe, beforeEach expect test jest afterEach */
const administrationMessageDataService = require('../../../services/data-access/administration-message.data.service')
const redisCacheService = require('../../../services/data-access/redis-cache.service')
const administrationMessageService = require('../../../services/administration-message.service')
const ValidationError = require('../../../lib/validation-error')
const { ServiceMessageCodesService } = require('../../../services/service-message/service-message.service')
const { ServiceMessageValidator } = require('../../../services/service-message/service-message.validator')
const logger = require('../../../services/log.service').getLogger()
const { marked } = require('marked')
const sanitiseService = require('../../../services/sanitise.service')

const serviceMessageRedisKey = 'serviceMessage'

describe('administrationMessageService', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getMessagesAndAreaCodes', () => {
    const mockServiceMessages = {
      areaCodes: [
        { code: 'A', description: 'A desc' },
        { code: 'B', description: 'B desc' },
        { code: 'C', description: 'C desc' },
        { code: 'P', description: 'P desc' }
      ],
      messages: [
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
    }

    beforeEach(() => {
      jest.spyOn(administrationMessageDataService, 'sqlFindServiceMessages').mockResolvedValue(mockServiceMessages)
      jest.spyOn(administrationMessageService, 'parseAndSanitise').mockResolvedValue([])
      jest.spyOn(ServiceMessageCodesService, 'getAreaCodes').mockResolvedValue([])
      jest.spyOn(redisCacheService, 'get').mockImplementation()
      jest.spyOn(redisCacheService, 'set').mockImplementation()
    })

    test('should call redis cache service to fetch the service message', async () => {
      await administrationMessageService.getMessagesAndAreaCodes()
      expect(redisCacheService.get).toHaveBeenCalled()
    })

    test('should not call administrationMessageDataService.sqlFindServiceMessages if service message is fetched from redis', async () => {
      jest.spyOn(redisCacheService, 'get').mockResolvedValue(mockServiceMessages)
      await administrationMessageService.getMessagesAndAreaCodes()
      expect(redisCacheService.get).toHaveBeenCalled()
      expect(administrationMessageDataService.sqlFindServiceMessages).not.toHaveBeenCalled()
    })

    test('should call administrationMessageDataService.sqlFindServiceMessages if redis service returns false while attempting to fetch the serviceMessage', async () => {
      jest.spyOn(redisCacheService, 'get').mockResolvedValue(false)
      await administrationMessageService.getMessagesAndAreaCodes()
      expect(redisCacheService.get).toHaveBeenCalled()
      expect(administrationMessageDataService.sqlFindServiceMessages).toHaveBeenCalled()
    })

    test('should call administrationMessageDataService.sqlFindServiceMessages if undefined is returned from redis service', async () => {
      jest.spyOn(redisCacheService, 'get').mockResolvedValue(undefined)
      await administrationMessageService.getMessagesAndAreaCodes()
      expect(redisCacheService.get).toHaveBeenCalled()
      expect(administrationMessageDataService.sqlFindServiceMessages).toHaveBeenCalled()
    })

    test('should convert the markdown to html', async () => {
      jest.spyOn(administrationMessageDataService, 'sqlFindServiceMessages').mockResolvedValue(mockServiceMessages.messages)
      jest.spyOn(ServiceMessageCodesService, 'getAreaCodes').mockResolvedValue(mockServiceMessages.areaCodes)
      await administrationMessageService.getMessagesAndAreaCodes()
      expect(administrationMessageService.parseAndSanitise).toHaveBeenCalledTimes(1)
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

  describe('getFilteredMessagesForRequest', () => {
    const sut = administrationMessageService

    beforeEach(() => {
      jest.spyOn(administrationMessageService, 'getMessagesAndAreaCodes').mockImplementation()
    })

    test('if no message data is retrieved then it returns an empty array', async () => {
      jest.spyOn(administrationMessageService, 'getMessagesAndAreaCodes').mockResolvedValue(undefined)
      const result = await sut.getFilteredMessagesForRequest('/')
      expect(result).toEqual([])
    })

    test('if the message data does not have a `messages` property it shortcircuits and an empty array is returned', async () => {
      jest.spyOn(administrationMessageService, 'getMessagesAndAreaCodes').mockResolvedValue({ wrong: {}, shape: {} })
      const result = await sut.getFilteredMessagesForRequest('/')
      expect(result).toEqual([])
    })

    test('if the message data does not have a `areaCodes` property it shortcircuits and an empty array is returned', async () => {
      jest.spyOn(administrationMessageService, 'getMessagesAndAreaCodes').mockResolvedValue({ messages: [], wrong: {} })
      const result = await sut.getFilteredMessagesForRequest('/')
      expect(result).toEqual([])
    })

    test('it filters the messages when in the Groups section', async () => {
      jest.spyOn(administrationMessageService, 'getMessagesAndAreaCodes').mockResolvedValue({
        messages: [
          {
            title: 'Title A',
            message: '<p>message body a</p>\n',
            borderColourCode: 'B',
            areaCodes: ['A'],
            urlSlug: '8F8E9B51-A95F-4233-A4B4-8B4859749CD3'
          },
          {
            title: 'Title B',
            message: '<p>message body b</p>\n',
            borderColourCode: 'B',
            areaCodes: ['G'],
            urlSlug: '8F8E9B51-A95F-4233-A4B4-8B4859749CD4'
          }
        ],
        areaCodes: [
          { code: 'A', description: 'A section' },
          { code: 'G', description: 'G section' }
        ]
      })
      const result = await sut.getFilteredMessagesForRequest('/group/')
      expect(result).toEqual([{
        title: 'Title B',
        message: '<p>message body b</p>\n',
        borderColourCode: 'B',
        areaCodes: ['G'],
        urlSlug: '8F8E9B51-A95F-4233-A4B4-8B4859749CD4'
      }])
    })

    test('it filters the messages when in the Access Arrangements section', async () => {
      jest.spyOn(administrationMessageService, 'getMessagesAndAreaCodes').mockResolvedValue({
        messages: [
          {
            title: 'Title A',
            message: '<p>message body a</p>\n',
            borderColourCode: 'B',
            areaCodes: ['A'],
            urlSlug: '8F8E9B51-A95F-4233-A4B4-8B4859749CD3'
          },
          {
            title: 'Title B',
            message: '<p>message body b</p>\n',
            borderColourCode: 'B',
            areaCodes: ['G'],
            urlSlug: '8F8E9B51-A95F-4233-A4B4-8B4859749CD4'
          }
        ],
        areaCodes: [
          { code: 'A', description: 'A section' },
          { code: 'G', description: 'G section' }
        ]
      })
      const result = await sut.getFilteredMessagesForRequest('/access-arrangements/')
      expect(result).toEqual([{
        title: 'Title A',
        message: '<p>message body a</p>\n',
        borderColourCode: 'B',
        areaCodes: ['A'],
        urlSlug: '8F8E9B51-A95F-4233-A4B4-8B4859749CD3'
      }])
    })

    test('it filters the messages when in the HDF section', async () => {
      jest.spyOn(administrationMessageService, 'getMessagesAndAreaCodes').mockResolvedValue({
        messages: [
          {
            title: 'Title A',
            message: '<p>message body a</p>\n',
            borderColourCode: 'B',
            areaCodes: ['A'],
            urlSlug: '8F8E9B51-A95F-4233-A4B4-8B4859749CD3'
          },
          {
            title: 'Title H',
            message: '<p>message body b</p>\n',
            borderColourCode: 'B',
            areaCodes: ['H'],
            urlSlug: '8F8E9B51-A95F-4233-A4B4-8B4859749CD4'
          }
        ],
        areaCodes: [
          { code: 'A', description: 'A section' },
          { code: 'H', description: 'H section' }
        ]
      })
      const result = await sut.getFilteredMessagesForRequest('/attendance/')
      expect(result).toEqual([{
        title: 'Title H',
        message: '<p>message body b</p>\n',
        borderColourCode: 'B',
        areaCodes: ['H'],
        urlSlug: '8F8E9B51-A95F-4233-A4B4-8B4859749CD4'
      }])
    })

    test('it filters the messages when in the non-sitings-codes section', async () => {
      jest.spyOn(administrationMessageService, 'getMessagesAndAreaCodes').mockResolvedValue({
        messages: [
          {
            title: 'Title A',
            message: '<p>message body a</p>\n',
            borderColourCode: 'B',
            areaCodes: ['A'],
            urlSlug: '8F8E9B51-A95F-4233-A4B4-8B4859749CD3'
          },
          {
            title: 'Title N',
            message: '<p>message body n</p>\n',
            borderColourCode: 'B',
            areaCodes: ['N'],
            urlSlug: 'DEE0DE69-C4C1-48B1-9D03-D1180832AAA6'
          }
        ],
        areaCodes: [
          { code: 'A', description: 'A section' },
          { code: 'H', description: 'H section' }
        ]
      })
      const result = await sut.getFilteredMessagesForRequest('/pupils-not-taking-the-check/')
      expect(result).toEqual([{
        title: 'Title N',
        message: '<p>message body n</p>\n',
        borderColourCode: 'B',
        areaCodes: ['N'],
        urlSlug: 'DEE0DE69-C4C1-48B1-9D03-D1180832AAA6'
      }])
    })

    test('it filters the messages when in the pin generation section', async () => {
      jest.spyOn(administrationMessageService, 'getMessagesAndAreaCodes').mockResolvedValue({
        messages: [
          {
            title: 'Title A',
            message: '<p>message body a</p>\n',
            borderColourCode: 'B',
            areaCodes: ['A'],
            urlSlug: '8F8E9B51-A95F-4233-A4B4-8B4859749CD3'
          },
          {
            title: 'Title P',
            message: '<p>message body p</p>\n',
            borderColourCode: 'B',
            areaCodes: ['P'],
            urlSlug: '5632F7E1-0954-44A8-BB10-C070E2A74906'
          }
        ],
        areaCodes: [
          { code: 'A', description: 'A section' },
          { code: 'H', description: 'H section' }
        ]
      })
      const result = await sut.getFilteredMessagesForRequest('/pupil-pin/')
      expect(result).toEqual([{
        title: 'Title P',
        message: '<p>message body p</p>\n',
        borderColourCode: 'B',
        areaCodes: ['P'],
        urlSlug: '5632F7E1-0954-44A8-BB10-C070E2A74906'
      }])
    })

    test('it filters the messages when in the pupil status section', async () => {
      jest.spyOn(administrationMessageService, 'getMessagesAndAreaCodes').mockResolvedValue({
        messages: [
          {
            title: 'Title A',
            message: '<p>message body a</p>\n',
            borderColourCode: 'B',
            areaCodes: ['A'],
            urlSlug: '8F8E9B51-A95F-4233-A4B4-8B4859749CD3'
          },
          {
            title: 'Title S',
            message: '<p>message body s</p>\n',
            borderColourCode: 'B',
            areaCodes: ['S'],
            urlSlug: '73A4203B-3D98-49FC-A7D3-600F87A00360'
          }
        ],
        areaCodes: [
          { code: 'A', description: 'A section' },
          { code: 'H', description: 'H section' }
        ]
      })
      const result = await sut.getFilteredMessagesForRequest('/pupil-status')
      expect(result).toEqual([{
        title: 'Title S',
        message: '<p>message body s</p>\n',
        borderColourCode: 'B',
        areaCodes: ['S'],
        urlSlug: '73A4203B-3D98-49FC-A7D3-600F87A00360'
      }])
    })

    test('it filters the messages when in the restart section', async () => {
      jest.spyOn(administrationMessageService, 'getMessagesAndAreaCodes').mockResolvedValue({
        messages: [
          {
            title: 'Title A',
            message: '<p>message body a</p>\n',
            borderColourCode: 'B',
            areaCodes: ['A'],
            urlSlug: '8F8E9B51-A95F-4233-A4B4-8B4859749CD3'
          },
          {
            title: 'Title R',
            message: '<p>message body r</p>\n',
            borderColourCode: 'B',
            areaCodes: ['R'],
            urlSlug: '34E1A831-7A18-41D7-8159-BE4787107A0B'
          }
        ],
        areaCodes: [
          { code: 'A', description: 'A section' },
          { code: 'S', description: 'S section' }
        ]
      })
      const result = await sut.getFilteredMessagesForRequest('/restart/')
      expect(result).toEqual([{
        title: 'Title R',
        message: '<p>message body r</p>\n',
        borderColourCode: 'B',
        areaCodes: ['R'],
        urlSlug: '34E1A831-7A18-41D7-8159-BE4787107A0B'
      }])
    })

    test('it filters the messages when in the pupil register section', async () => {
      jest.spyOn(administrationMessageService, 'getMessagesAndAreaCodes').mockResolvedValue({
        messages: [
          {
            title: 'Title A',
            message: '<p>message body a</p>\n',
            borderColourCode: 'B',
            areaCodes: ['A'],
            urlSlug: '8F8E9B51-A95F-4233-A4B4-8B4859749CD3'
          },
          {
            title: 'Title T',
            message: '<p>message body t</p>\n',
            borderColourCode: 'B',
            areaCodes: ['T'],
            urlSlug: 'E21BC54E-E663-4B9B-9BEE-9C31093F9F2E'
          }
        ],
        areaCodes: [
          { code: 'A', description: 'A section' },
          { code: 'T', description: 'T section' }
        ]
      })
      const result = await sut.getFilteredMessagesForRequest('/pupil-register/')
      expect(result).toEqual([{
        title: 'Title T',
        message: '<p>message body t</p>\n',
        borderColourCode: 'B',
        areaCodes: ['T'],
        urlSlug: 'E21BC54E-E663-4B9B-9BEE-9C31093F9F2E'
      }])
    })

    test('filters to empty array when no messages are specified', async () => {
      jest.spyOn(administrationMessageService, 'getMessagesAndAreaCodes').mockResolvedValue({
        messages: [
          {
            title: 'Title A',
            message: '<p>message body a</p>\n',
            borderColourCode: 'B',
            areaCodes: ['A'],
            urlSlug: '8F8E9B51-A95F-4233-A4B4-8B4859749CD3'
          },
          {
            title: 'Title T',
            message: '<p>message body t</p>\n',
            borderColourCode: 'B',
            areaCodes: ['T'],
            urlSlug: 'E21BC54E-E663-4B9B-9BEE-9C31093F9F2E'
          }
        ],
        areaCodes: [
          { code: 'A', description: 'A section' },
          { code: 'T', description: 'T section' }
        ]
      })
      const result = await sut.getFilteredMessagesForRequest('/school/school-home')
      expect(result).toEqual([])
    })

    test('a global message (for every section) will be shown other pages too', async () => {
      jest.spyOn(administrationMessageService, 'getMessagesAndAreaCodes').mockResolvedValue({
        messages: [
          {
            title: 'Global title',
            message: '<p>Global message</p>\n',
            borderColourCode: 'O',
            areaCodes: ['A', 'H', 'N', 'P', 'G', 'S', 'R', 'T'],
            urlSlug: '0C710428-51ED-4BB6-8E81-32D40FFFB1C9'
          }
        ],
        areaCodes: [
          { code: 'A', description: 'A section' },
          { code: 'H', description: 'H section' },
          { code: 'N', description: 'N section' },
          { code: 'P', description: 'P section' },
          { code: 'G', description: 'G section' },
          { code: 'S', description: 'S section' },
          { code: 'R', description: 'R section' },
          { code: 'T', description: 'T section' }
        ]
      })
      const result = await sut.getFilteredMessagesForRequest('/service-manager/')
      expect(result).toEqual([{
        title: 'Global title',
        message: '<p>Global message</p>\n',
        borderColourCode: 'O',
        areaCodes: ['A', 'H', 'N', 'P', 'G', 'S', 'R', 'T'],
        urlSlug: '0C710428-51ED-4BB6-8E81-32D40FFFB1C9'
      }])
    })

    test('if an error is thrown it is not re-thrown and an empty array is returned', async () => {
      jest.spyOn(administrationMessageService, 'getMessagesAndAreaCodes').mockRejectedValue(new Error('mock error'))
      jest.spyOn(logger, 'error').mockImplementation()
      const result = await sut.getFilteredMessagesForRequest('/service-manager/')
      expect(result).toEqual([])
    })
  })

  describe('getRawServiceMessages', () => {
    test('it calls the database', async () => {
      jest.spyOn(administrationMessageDataService, 'sqlFindServiceMessages').mockImplementation()
      await administrationMessageService.getRawServiceMessages()
      expect(administrationMessageDataService.sqlFindServiceMessages).toHaveBeenCalledTimes(1)
    })
  })

  describe('parseAndSanitise', () => {
    test('it returns undefined if passed undefined', () => {
      expect(administrationMessageService.parseAndSanitise(undefined)).toBeUndefined()
    })

    test('if there is a parsing error it returns undefined', () => {
      jest.spyOn(marked, 'parse').mockImplementation(() => { throw Error('mock parsing error') })
      jest.spyOn(logger, 'alert')
      expect(administrationMessageService.parseAndSanitise([
        { title: 'a title', message: 'the msg', borderColourCode: 'O', areaCodes: ['A', 'P'], urlSlug: '222b8699-7040-41f2-9879-749b729db22c' }
      ])).toBe(undefined)
      expect(logger.alert).toHaveBeenCalledTimes(1)
    })

    test('it turns markdown into html', () => {
      const rawMsg = { title: 'a title', message: '# heading\n body', borderColourCode: 'O', areaCodes: ['A', 'P'], urlSlug: '222b8699-7040-41f2-9879-749b729db22c' }
      jest.spyOn(sanitiseService, 'sanitise').mockImplementation(a => a)
      const clean = administrationMessageService.parseAndSanitise([rawMsg])
      expect(clean[0].message).toBe('<h1 id="heading">heading</h1>\n<p> body</p>\n')
    })

    test('it sanitises the html', () => {
      const rawMsg = { title: 'a title', message: '# heading\n body', borderColourCode: 'O', areaCodes: ['A', 'P'], urlSlug: '222b8699-7040-41f2-9879-749b729db22c' }
      jest.spyOn(sanitiseService, 'sanitise')
      administrationMessageService.parseAndSanitise([rawMsg])
      expect(sanitiseService.sanitise).toHaveBeenCalledTimes(1)
    })
  })

  describe('getRawMessageBySlug', () => {
    beforeEach(() => {
      jest.spyOn(administrationMessageDataService, 'sqlFindServiceMessageBySlug').mockImplementation()
      jest.spyOn(logger, 'error').mockImplementation()
    })
    test('it calls the data service to get the raw message from the db', async () => {
      await administrationMessageService.getRawMessageBySlug('707d2405-70cf-4275-9f83-a7b2736cf62e')
      expect(administrationMessageDataService.sqlFindServiceMessageBySlug).toHaveBeenCalledTimes(1)
    })

    test('it returns undefined if the service throws an error', async () => {
      jest.spyOn(administrationMessageDataService, 'sqlFindServiceMessageBySlug').mockRejectedValue(new Error('mock error'))
      const res = await administrationMessageService.getRawMessageBySlug('707d2405-70cf-4275-9f83-a7b2736cf62e')
      expect(res).toBeUndefined()
    })
  })
})
