'use strict'

/* global describe, test, expect, jest, afterEach */
const sut = require('../../../services/tech-support-queue-management.service')
const storageDataService = require('../../../services/data-access/azure-queue.data.service')
const serviceBusQueueAdminService = require('../../../services/data-access/service-bus-queue-admin.service')
const service = require('../../../services/check-diagnostic.service')

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
      jest.spyOn(serviceBusQueueAdminService, 'getQueueMessageCount').mockResolvedValueOnce({ activeMessageCount })
      await sut.clearServiceBusQueue(queueName)
      expect(serviceBusQueueAdminService.getQueueMessageCount).toHaveBeenCalledTimes(1)
      expect(serviceBusQueueAdminService.clearQueue).toHaveBeenCalledWith(queueName, activeMessageCount)
    })

    test('if message count is zero, should not attempt to clear the queue', async () => {
      const queueName = 'q1'
      const activeMessageCount = 0
      jest.spyOn(serviceBusQueueAdminService, 'clearQueue').mockResolvedValueOnce()
      jest.spyOn(serviceBusQueueAdminService, 'getQueueMessageCount').mockResolvedValueOnce({ activeMessageCount })
      await sut.clearServiceBusQueue(queueName)
      expect(serviceBusQueueAdminService.getQueueMessageCount).toHaveBeenCalledTimes(1)
      expect(serviceBusQueueAdminService.clearQueue).not.toHaveBeenCalled()
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
