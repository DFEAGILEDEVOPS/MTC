/* global describe it expect jasmine fail beforeEach spyOn */

require('dotenv').config()

const azureQueueService = require('../../../services/azure-queue.service')

describe('azure-queue-service', () => {
  describe('add-message', () => {
    let queueServiceMock
    const payload = {some: 'payLoad'}
    const queueName = 'some-test-queue'

    beforeEach(() => {
      queueServiceMock = {
        createMessage: jasmine.createSpy()
      }
    })

    it('throws an error if the queueName param is zero length', () => {
      try {
        azureQueueService.addMessage('', payload, queueServiceMock)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Missing queueName')
      }
    })

    it('throws an error if the queueName param is not provided', () => {
      try {
        azureQueueService.addMessage(null, payload, queueServiceMock)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Missing queueName')
      }
    })

    it('stringifies the payload', () => {
      spyOn(JSON, 'stringify').and.callThrough()
      azureQueueService.addMessage(queueName, payload, queueServiceMock)
      expect(JSON.stringify).toHaveBeenCalledWith(payload)
    })

    it('injects the message into the queue by calling `createMessage`', () => {
      azureQueueService.addMessage(queueName, payload, queueServiceMock)
      expect(queueServiceMock.createMessage).toHaveBeenCalled()
    })
  })
})
