/* global describe expect beforeEach jest fail it */

const sasTokenService = require('../../../services/sas-token.service')
const moment = require('moment')

describe('sas-token.service', () => {
  describe('generateSasToken', () => {
    const queueName = 'some-queue'
    const expiryDate = moment().add(1, 'hour')
    let queueServiceMock

    beforeEach(() => {
      queueServiceMock = {
        generateSharedAccessSignature: jest.fn('mock token'),
        getUrl: jest.fn('http://localhost/queue')
      }
    })

    it('throws an error if the expiryDate is not provided', () => {
      try {
        sasTokenService.generateSasToken(queueName, null, queueServiceMock)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Invalid expiryDate')
      }
    })

    it('throws an error if the expiryDate is not a moment object', () => {
      try {
        sasTokenService.generateSasToken(queueName, { object: 'yes' }, queueServiceMock)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Invalid expiryDate')
      }
    })

    it('throws an error if the expiryDate is not a moment object', () => {
      try {
        sasTokenService.generateSasToken(queueName, new Date(), queueServiceMock)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Invalid expiryDate')
      }
    })

    it('sets the start Date to more than 4.5 minutes in the past', () => {
      sasTokenService.generateSasToken(queueName, expiryDate, queueServiceMock)
      const args = queueServiceMock.generateSharedAccessSignature.calls.mostRecent().args
      const fourAndAHalfMinutesAgo = moment().subtract(1, 'minutes').subtract(30, 'seconds')
      expect(args[1].AccessPolicy.Start).toBeLessThan(fourAndAHalfMinutesAgo)
    })

    it('it generates the SAS token', () => {
      const res = sasTokenService.generateSasToken(queueName, expiryDate, queueServiceMock)
      expect(queueServiceMock.generateSharedAccessSignature).toHaveBeenCalled()
      expect(queueServiceMock.getUrl).toHaveBeenCalled()
      expect({}.hasOwnProperty.call(res, 'token')).toBe(true)
      expect({}.hasOwnProperty.call(res, 'url')).toBe(true)
    })

    it('sets the permissions to add only', () => {
      sasTokenService.generateSasToken(queueName, expiryDate, queueServiceMock)
      const args = queueServiceMock.generateSharedAccessSignature.calls.mostRecent().args
      expect(args[1].AccessPolicy.Permissions).toBe('a')
    })
  })
})
