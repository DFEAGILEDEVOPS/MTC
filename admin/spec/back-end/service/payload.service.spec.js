'use strict'
/* global describe, test, expect, jest, afterEach */
const R = require('ramda')
const service = require('../../../services/payload.service')
const payloadDataService = require('../../../services/data-access/payload.data.service')
const compressionService = require('../../../services/compression.service')
const mockCheckCode = '5d557d6a-b1d9-406e-b5d0-7c26e5f2bdb5'

describe('payload.service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('#getPayload', () => {
    test('throws an error when called without a checkCode', async () => {
      await expect(service.getPayload()).rejects.toThrow('Missing checkCode')
    })

    test('throws an error when checkCode is not valid UUID', async () => {
      await expect(service.getPayload('abc')).rejects.toThrow('checkCode is not a valid UUID')
    })

    test('adds relativeTimings', async () => {
      jest.spyOn(service, 'addRelativeTimings').mockImplementation()
      const mockArchive = {
        inputs: [],
        audit: []
      }
      jest.spyOn(compressionService, 'decompressFromGzip').mockReturnValueOnce(JSON.stringify(mockArchive))
      jest.spyOn(payloadDataService, 'sqlFindOneByCheckCode').mockResolvedValue({
        inputs: [],
        audit: [],
        archive: 'mocked',
        checkVersion: 4
      })
      await service.getPayload(mockCheckCode)
      expect(service.addRelativeTimings).toHaveBeenCalled()
    })
  })

  describe('#addRelativeTimingsToSection', () => {
    test('passes through objects without a `clientTimestamp` prop', () => {
      const mock = [
        { a: 'foo', b: 'bar' },
        { a: 'baz', b: 'quux' }
      ]
      const res = service.addRelativeTimingsToSection(mock)
      expect(res.length).toBe(2)
      expect(R.equals(res, mock)).toBeTruthy()
    })

    test('sets relativeTiming to "+0.00" for the first element', () => {
      const mock = [
        { id: 1, clientTimestamp: '2019-05-24T17:10:16.808Z' }
      ]
      const res = service.addRelativeTimingsToSection(mock)
      expect({}.hasOwnProperty.call(res[0], 'relativeTiming')).toBeTruthy()
      expect(res[0].relativeTiming).toEqual('+0.00')
      expect(res[0].clientTimestamp).toEqual('2019-05-24T17:10:16.808Z')
    })

    test('returns a new array', () => {
      const mock = [
        { id: 1, clientTimestamp: '2019-05-24T17:10:16.808Z' }
      ]
      const res = service.addRelativeTimingsToSection(mock)
      expect(R.identical(res, mock)).toBeFalsy()
    })

    test('adds relativeTimings for elements after the first one', () => {
      const mock = [
        { id: 1, clientTimestamp: '2019-05-24T17:09:32.140Z' },
        { id: 2, clientTimestamp: '2019-05-24T17:09:35.156Z' },
        { id: 3, clientTimestamp: '2019-05-24T17:09:35.156Z' }
      ]
      const res = service.addRelativeTimingsToSection(mock)
      expect(res[1].relativeTiming).toEqual('+3.016')
      expect(res[2].relativeTiming).toEqual('+0')
    })

    test('timings are not reset by an obj without a timestamp prop', () => {
      const mock = [
        { id: 1, clientTimestamp: '2019-05-24T17:09:32.140Z' },
        { id: 2 },
        { id: 3, clientTimestamp: '2019-05-24T17:09:35.156Z' }
      ]
      const res = service.addRelativeTimingsToSection(mock)
      expect(res[2].relativeTiming).toEqual('+3.016')
      expect(R.prop('relativeTiming', res)).toBeFalsy()
    })

    test('can handle non-object input', () => {
      const mock = [
        { id: 1, clientTimestamp: '2019-05-24T17:09:32.140Z' },
        undefined,
        { id: 3, clientTimestamp: '2019-05-24T17:09:35.156Z' }
      ]
      const res = service.addRelativeTimingsToSection(mock)
      expect(res[2].relativeTiming).toEqual('+3.016')
      expect(res[1]).toBeUndefined()
    })

    test('can handle times that go backward', () => {
      const mock = [
        { id: 1, clientTimestamp: '2019-05-24T17:09:35.156Z' },
        { id: 3, clientTimestamp: '2019-05-24T17:09:32.140Z' }
      ]
      const res = service.addRelativeTimingsToSection(mock)
      expect(res[1].relativeTiming).toEqual('-3.016')
    })
  })

  describe('#addRelativeTimings', () => {
    test('adds timings to the inputs and audit sections', () => {
      jest.spyOn(service, 'addRelativeTimingsToSection').mockImplementation()
      const mock = {
        inputs: [],
        audit: []
      }
      service.addRelativeTimings(mock)
      expect(service.addRelativeTimingsToSection).toHaveBeenCalledTimes(2)
    })
  })

  describe('base64 compressed payloads', () => {
    test('uses base64 decompression when check is version 3', async () => {
      const archiveContents = 'contents-of-archive'
      jest.spyOn(payloadDataService, 'sqlFindOneByCheckCode').mockResolvedValue({
        inputs: [],
        audit: [],
        archive: archiveContents,
        checkVersion: 3
      })
      jest.spyOn(compressionService, 'decompressFromBase64').mockReturnValueOnce(JSON.stringify({
        inputs: [],
        audit: []
      }))
      await service.getPayload(mockCheckCode)
      expect(compressionService.decompressFromBase64).toHaveBeenCalledWith(archiveContents)
    })
  })
})
