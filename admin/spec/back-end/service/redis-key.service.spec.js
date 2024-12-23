'use strict'

const redisKeyService = require('../../../services/redis-key.service')
const sut = redisKeyService

describe('redis-key.service', () => {
  describe('getPupilRegisterViewDataKey', () => {
    test('returns the pupil register view key based on school id', () => {
      const keyName = redisKeyService.getPupilRegisterViewDataKey(1)
      expect(keyName).toBe('pupilRegisterViewData:1')
    })
    test('throws an error if school id is not provided', () => {
      expect(() => { redisKeyService.getPupilRegisterViewDataKey(undefined) }).toThrowError('School id parameter not provided')
    })
  })

  describe('getSasTokenKey', () => {
    test('is defined', () => {
      expect(sut.getSasTokenKey).toBeDefined()
    })

    test('returns the redis key value for the queue', () => {
      expect(sut.getSasTokenKey('fooQueue')).toBe('sasToken:fooQueue')
    })
  })

  describe('getSchoolResultsKey', () => {
    test('is defined', () => {
      expect(sut.getSchoolResultsKey).toBeDefined()
    })

    test('returns the redis key for the school', () => {
      expect(sut.getSchoolResultsKey(321)).toBe('result:321')
    })
  })
})
