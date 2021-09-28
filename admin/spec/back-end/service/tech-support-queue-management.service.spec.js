'use strict'

/* global describe, it, expect, spyOn */
const sut = require('../../../services/tech-support-queue-management.service')
const storageDataService = require('../../../services/data-access/storage-queue-metadata.service')

describe('tech support queue management service', () => {
  it('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('storage account functionality', () => {
    it('should return empty array when no queues found', async () => {
      spyOn(storageDataService, 'getAllQueueMessageCounts')
      const output = await sut.getStorageAccountQueueSummary()
      expect(storageDataService.getAllQueueMessageCounts).toHaveBeenCalledTimes(1)
      expect(output).toBeDefined()
      expect(output).toEqual([])
      expect(output.length).toBe(0)
    })

    it('should combine active and poison queue messages into one array item', async () => {
      const rawData = [
        {
          name: 'q1',
          approximateMessageCount: 5
        },
        {
          name: 'q1-poison',
          approximateMessageCount: 10
        },
        {
          name: 'q2',
          approximateMessageCount: 1
        },
        {
          name: 'q2-poison',
          approximateMessageCount: 2
        }
      ]
      spyOn(storageDataService, 'getAllQueueMessageCounts').and.returnValue(rawData)
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
