'use strict'
/* global describe, it, expect, fail, spyOn */
const R = require('ramda')
const service = require('../../../services/payload.service')
const payloadDataService = require('../../../services/data-access/payload.data.service')

describe('payload.service', () => {
  describe('#getPayload', () => {
    it('throws an error when called without a checkCode', async () => {
      try {
        await service.getPayload()
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toEqual('Missing checkCode')
      }
    })

    it('adds relativeTimings', async () => {
      spyOn(service, 'addRelativeTimings')
      spyOn(payloadDataService, 'sqlFindOneByCheckCode').and.returnValue({
        inputs: [],
        audit: []
      })
      await service.getPayload('abc-def')
      expect(service.addRelativeTimings).toHaveBeenCalled()
    })
  })

  describe('#addRelativeTimingsToSection', () => {
    it('passes through objects without a `clientTimestamp` prop', () => {
      const mock = [
        { a: 'foo', b: 'bar' },
        { a: 'baz', b: 'quux' }
      ]
      const res = service.addRelativeTimingsToSection(mock)
      expect(res.length).toBe(2)
      expect(R.equals(res, mock)).toBeTruthy()
    })

    it('sets relativeTiming to "+0.00" for the first element', () => {
      const mock = [
        { id: 1, clientTimestamp: '2019-05-24T17:10:16.808Z' }
      ]
      const res = service.addRelativeTimingsToSection(mock)
      expect(res[0].hasOwnProperty('relativeTiming')).toBeTruthy()
      expect(res[0].relativeTiming).toEqual('+0.00')
      expect(res[0].clientTimestamp).toEqual('2019-05-24T17:10:16.808Z')
    })

    it('returns a new array', () => {
      const mock = [
        { id: 1, clientTimestamp: '2019-05-24T17:10:16.808Z' }
      ]
      const res = service.addRelativeTimingsToSection(mock)
      expect(R.identical(res, mock)).toBeFalsy()
    })

    it('adds relativeTimings for elements after the first one', () => {
      const mock = [
        { id: 1, clientTimestamp: '2019-05-24T17:09:32.140Z' },
        { id: 2, clientTimestamp: '2019-05-24T17:09:35.156Z' },
        { id: 3, clientTimestamp: '2019-05-24T17:09:35.156Z' }
      ]
      const res = service.addRelativeTimingsToSection(mock)
      expect(res[1].relativeTiming).toEqual('+3.016')
      expect(res[2].relativeTiming).toEqual('+0')
    })

    it('timings are not reset by an obj without a timestamp prop', () => {
      const mock = [
        { id: 1, clientTimestamp: '2019-05-24T17:09:32.140Z' },
        { id: 2 },
        { id: 3, clientTimestamp: '2019-05-24T17:09:35.156Z' }
      ]
      const res = service.addRelativeTimingsToSection(mock)
      expect(res[2].relativeTiming).toEqual('+3.016')
      expect(R.prop('relativeTiming', res)).toBeFalsy()
    })

    it('can handle non-object input', () => {
      const mock = [
        { id: 1, clientTimestamp: '2019-05-24T17:09:32.140Z' },
        undefined,
        { id: 3, clientTimestamp: '2019-05-24T17:09:35.156Z' }
      ]
      const res = service.addRelativeTimingsToSection(mock)
      expect(res[2].relativeTiming).toEqual('+3.016')
      expect(res[1]).toBeUndefined()
    })

    it('can handle times that go backward', () => {
      const mock = [
        { id: 1, clientTimestamp: '2019-05-24T17:09:35.156Z' },
        { id: 3, clientTimestamp: '2019-05-24T17:09:32.140Z' }
      ]
      const res = service.addRelativeTimingsToSection(mock)
      expect(res[1].relativeTiming).toEqual('-3.016')
    })
  })

  describe('#addRelativeTimings', () => {
    it('adds timings to the inputs and audit sections', () => {
      spyOn(service, 'addRelativeTimingsToSection')
      const mock = {
        inputs: [],
        audit: []
      }
      service.addRelativeTimings(mock)
      expect(service.addRelativeTimingsToSection).toHaveBeenCalledTimes(2)
    })
  })
})
