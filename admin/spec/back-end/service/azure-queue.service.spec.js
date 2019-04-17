/* global describe it expect jasmine fail beforeEach spyOn */

require('dotenv').config()

const azureQueueService = require('../../../services/azure-queue.service')

describe('azure-queue-service', () => {
  describe('add-message', () => {
    let queueServiceMock
    const payload = { some: 'payLoad' }
    const queueName = 'some-test-queue'

    beforeEach(() => {
      queueServiceMock = {
        createMessageAsync: jasmine.createSpy()
      }
    })

    it('throws an error if the queueName param is zero length', async () => {
      try {
        await azureQueueService.addMessageAsync('', payload, queueServiceMock)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Missing queueName')
      }
    })

    it('throws an error if the queueName param is not provided', async () => {
      try {
        await azureQueueService.addMessageAsync(null, payload, queueServiceMock)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Missing queueName')
      }
    })

    it('stringifies the payload', async () => {
      spyOn(JSON, 'stringify').and.callThrough()
      await azureQueueService.addMessageAsync(queueName, payload, queueServiceMock)
      expect(JSON.stringify).toHaveBeenCalledWith(payload)
    })

    it('injects the message into the queue by calling `createMessageAsync`', async () => {
      await azureQueueService.addMessageAsync(queueName, payload, queueServiceMock)
      expect(queueServiceMock.createMessageAsync).toHaveBeenCalled()
    })
  })
})
