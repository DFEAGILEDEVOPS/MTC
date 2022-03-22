'use strict'

/* global describe, test, expect, jest, afterEach */
const sut = require('../../../services/tech-support-queue-management.service')
const storageDataService = require('../../../services/data-access/azure-queue.data.service')

describe('tech support queue management service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
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
