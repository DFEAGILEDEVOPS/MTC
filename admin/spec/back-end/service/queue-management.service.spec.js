'use strict'

const sut = require('../../../services/queue-management.service')
const storageDataService = require('../../../services/data-access/azure-queue.data.service')
const serviceBusQueueAdminService = require('../../../services/data-access/service-bus-queue-admin.data.service')

describe('tech support queue management service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('service bus functionality', () => {
    test('should return empty array when no queues found', async () => {
      jest.spyOn(serviceBusQueueAdminService, 'getAllQueueMessageCounts').mockResolvedValueOnce([])
      const output = await sut.getServiceBusQueueSummary()
      expect(serviceBusQueueAdminService.getAllQueueMessageCounts).toHaveBeenCalledTimes(1)
      expect(output).toBeDefined()
      expect(output).toEqual([])
      expect(output.length).toBe(0)
    })

    test('should return queue message counts', async () => {
      const rawData = [
        {
          name: 'q1',
          activeMessageCount: 5,
          deadLetterCount: 10
        },
        {
          name: 'q2',
          activeMessageCount: 1,
          deadLetterCount: 2
        }
      ]
      jest.spyOn(serviceBusQueueAdminService, 'getAllQueueMessageCounts').mockResolvedValue(rawData)
      const output = await sut.getServiceBusQueueSummary()
      expect(serviceBusQueueAdminService.getAllQueueMessageCounts).toHaveBeenCalledTimes(1)
      expect(output).toBeDefined()
      expect(output.length).toBe(2)
      expect(output[0].name).toEqual('q1')
      expect(output[0].activeMessageCount).toEqual(5)
      expect(output[0].deadLetterCount).toEqual(10)
      expect(output[1].name).toEqual('q2')
      expect(output[1].activeMessageCount).toEqual(1)
      expect(output[1].deadLetterCount).toEqual(2)
    })

    test('should clear a service bus queue', async () => {
      const queueName = 'q1'
      const activeMessageCount = 5
      jest.spyOn(serviceBusQueueAdminService, 'clearQueue').mockResolvedValueOnce()
      jest.spyOn(serviceBusQueueAdminService, 'getQueueActiveMessageCount').mockResolvedValueOnce(activeMessageCount)
      await sut.clearServiceBusQueue(queueName)
      expect(serviceBusQueueAdminService.getQueueActiveMessageCount).toHaveBeenCalledTimes(1)
      expect(serviceBusQueueAdminService.clearQueue).toHaveBeenCalledWith(queueName, activeMessageCount)
    })

    test('if message count is zero, should not attempt to clear the queue', async () => {
      const queueName = 'q1'
      const activeMessageCount = 0
      jest.spyOn(serviceBusQueueAdminService, 'clearQueue').mockResolvedValueOnce()
      jest.spyOn(serviceBusQueueAdminService, 'getQueueActiveMessageCount').mockResolvedValueOnce(activeMessageCount)
      await sut.clearServiceBusQueue(queueName)
      expect(serviceBusQueueAdminService.getQueueActiveMessageCount).toHaveBeenCalledTimes(1)
      expect(serviceBusQueueAdminService.clearQueue).not.toHaveBeenCalled()
    })

    test('should send a message to a service bus queue', async () => {})
    test('if message is JSON, should convert to object before sending', async () => {
      const queueName = 'q1'
      const message = '{"pupilUUID":"1234","version":1}'
      const contentType = 'application/json'
      jest.spyOn(serviceBusQueueAdminService, 'sendMessageToQueue').mockResolvedValueOnce()
      await sut.sendServiceBusQueueMessage(queueName, message, contentType)
      expect(serviceBusQueueAdminService.sendMessageToQueue).toHaveBeenCalledWith(queueName, JSON.parse(message), contentType)
    })
  })

  describe('storage account functionality', () => {
    test('should return empty array when no queues found', async () => {
      jest.spyOn(storageDataService, 'getAllQueueMessageCounts').mockImplementation()
      const output = await sut.getStorageAccountQueueSummary()
      expect(storageDataService.getAllQueueMessageCounts).toHaveBeenCalledTimes(1)
      expect(output).toBeDefined()
      expect(output).toEqual([])
      expect(output.length).toBe(0)
    })

    test('should combine active and poison queue messages into one array item', async () => {
      const rawData = [
        {
          name: 'q1',
          approximateMessagesCount: 5
        },
        {
          name: 'q1-poison',
          approximateMessagesCount: 10
        },
        {
          name: 'q2',
          approximateMessagesCount: 1
        },
        {
          name: 'q2-poison',
          approximateMessagesCount: 2
        }
      ]
      jest.spyOn(storageDataService, 'getAllQueueMessageCounts').mockResolvedValue(rawData)
      const output = await sut.getStorageAccountQueueSummary()
      expect(storageDataService.getAllQueueMessageCounts).toHaveBeenCalledTimes(1)
      expect(output).toBeDefined()
      expect(output.length).toBe(2)
      expect(output[0].name).toEqual('q1')
      expect(output[0].activeMessageCount).toEqual(5)
      expect(output[0].deadLetterCount).toEqual(10)
      expect(output[1].name).toEqual('q2')
      expect(output[1].activeMessageCount).toEqual(1)
      expect(output[1].deadLetterCount).toEqual(2)
    })
  })
})
