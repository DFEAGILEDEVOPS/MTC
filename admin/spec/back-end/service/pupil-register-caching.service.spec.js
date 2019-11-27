'use strict'

/* global describe expect it beforeEach spyOn fail */

const redisCacheService = require('../../../services/data-access/redis-cache.service')
const pupilRegisterCachingService = require('../../../services/pupil-register-caching.service')

describe('pupil-register-caching.service', () => {
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
    it('throws if pupil register data are not provided', async () => {
      try {
        await pupilRegisterCachingService.setPupilRegisterCache(1, undefined)
        fail()
      } catch (error) {
        expect(error.message).toBe('Pupil register view data not provided')
      }
    })
    it('calls redisCacheService set when both arguments are provided', async () => {
      try {
        await pupilRegisterCachingService.setPupilRegisterCache(1, [{ id: 1 }])
      } catch (error) {
        fail()
      }
      expect(redisCacheService.set).toHaveBeenCalled()
    })
  })
  describe('#dropPupilRegisterCache', () => {
    beforeEach(() => {
      spyOn(redisCacheService, 'set')
    })
    it('throws if school id is not provided', async () => {
      try {
        await pupilRegisterCachingService.dropPupilRegisterCache(undefined)
        fail()
      } catch (error) {
        expect(error.message).toBe('School id not found in session')
      }
    })
    it('calls redisCacheService drop when school id is provided', async () => {
      spyOn(redisCacheService, 'drop')
      try {
        await pupilRegisterCachingService.dropPupilRegisterCache(1)
      } catch (error) {
        fail()
      }
      expect(redisCacheService.drop).toHaveBeenCalled()
    })
  })
})
