'use strict'

/* global describe expect it beforeEach spyOn fail */

const redisCacheService = require('../../../services/data-access/redis-cache.service')
const pupilRegisterCachingService = require('../../../services/pupil-register-caching.service')

describe('pupil-register.service', () => {
  describe('#setPupilRegisterCache', () => {
    beforeEach(() => {
      spyOn(redisCacheService, 'set')
    })
    it('throws if school id is not provided', async () => {
      try {
        await pupilRegisterCachingService.setPupilRegisterCache(undefined, undefined)
        fail()
      } catch (error) {
        expect(error.message).toBe('School id not found in session')
      }
    })
    it('throws if getPupilRegister method is not provided', async () => {
      try {
        await pupilRegisterCachingService.setPupilRegisterCache(1, undefined)
        fail()
      } catch (error) {
        expect(error.message).toBe('Data method for retrieving pupils not provided')
      }
    })
    it('calls redisCacheService set when both arguments are provided', async () => {
      try {
        await pupilRegisterCachingService.setPupilRegisterCache(1, () => [])
      } catch (error) {
        fail()
      }
      expect(redisCacheService.set).toHaveBeenCalled()
    })
  })
})
