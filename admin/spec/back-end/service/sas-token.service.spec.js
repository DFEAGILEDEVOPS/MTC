/* global describe expect it beforeEach jasmine fail */

const sasTokenService = require('../../../services/sas-token.service')
const moment = require('moment')

describe('sas-token.service', () => {
  describe('generateSasToken', () => {
    const queueName = 'some-queue'
    const expiryDate = moment().add(1, 'hour')
    let queueServiceMock

    beforeEach(() => {
      queueServiceMock = {
        generateSharedAccessSignature: jasmine.createSpy().and.returnValue('mock token'),
        getUrl: jasmine.createSpy().and.returnValue('http://localhost/queue')
      }
    })

    xit('throws an error if the expiryDate is not provided', () => {
      try {
        sasTokenService.generateSasToken(queueName, null, queueServiceMock)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Invalid expiryDate')
      }
    })

    xit('throws an error if the expiryDate is not a moment object', () => {
      try {
        sasTokenService.generateSasToken(queueName, {object: 'yes'}, queueServiceMock)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Invalid expiryDate')
      }
    })

    xit('throws an error if the expiryDate is not a moment object', () => {
      try {
        sasTokenService.generateSasToken(queueName, new Date(), queueServiceMock)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Invalid expiryDate')
      }
    })

    xit('sets the start Date to more than 4.5 minutes in the past', () => {
      sasTokenService.generateSasToken(queueName, expiryDate, queueServiceMock)
      const args = queueServiceMock.generateSharedAccessSignature.calls.mostRecent().args
      const fourAndAHalfMinutesAgo = moment().subtract(1, 'minutes').subtract(30, 'seconds')
      expect(args[1].AccessPolicy.Start).toBeLessThan(fourAndAHalfMinutesAgo)
    })

    xit('it generates the SAS token', () => {
      const res = sasTokenService.generateSasToken(queueName, expiryDate, queueServiceMock)
      expect(queueServiceMock.generateSharedAccessSignature).toHaveBeenCalled()
      expect(queueServiceMock.getUrl).toHaveBeenCalled()
      expect(res.hasOwnProperty('token')).toBe(true)
      expect(res.hasOwnProperty('url')).toBe(true)
    })

    xit('sets the permissions to add only', () => {
      sasTokenService.generateSasToken(queueName, expiryDate, queueServiceMock)
      const args = queueServiceMock.generateSharedAccessSignature.calls.mostRecent().args
      expect(args[1].AccessPolicy.Permissions).toBe('a')
    })
  })
})
