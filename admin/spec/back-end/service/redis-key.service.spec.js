'use strict'

/* global describe expect it fail */

const redisKeyService = require('../../../services/redis-key.service')

describe('redis-key.service', () => {
  describe('getPupilRegisterViewDataKey', () => {
    it('returns the pupil register view key based on school id', () => {
      let keyName
      try {
        keyName = redisKeyService.getPupilRegisterViewDataKey(1)
      } catch (ignore) {
        fail()
      }
      expect(keyName).toBe('pupilRegisterViewData:1')
    })
    it('throws an error if school id is not provided', () => {
      try {
        redisKeyService.getPupilRegisterViewDataKey(undefined)
        fail()
      } catch (error) {
        expect(error.message).toBe('School id parameter not provided')
      }
    })
  })
})
