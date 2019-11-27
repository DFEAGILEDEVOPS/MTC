'use strict'

/* global describe expect it beforeEach spyOn fail */

const featureToggles = require('feature-toggles')

const redisCacheService = require('../../../services/data-access/redis-cache.service')
const pupilRegisterV2Service = require('../../../services/pupil-register-v2.service')
const pupilRegisterService = require('../../../services/pupil-register.service')
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
  describe('#refreshPupilRegisterCache', () => {
    beforeEach(() => {
      spyOn(redisCacheService, 'set')
    })
    it('throws if school id is not provided', async () => {
      try {
        await pupilRegisterCachingService.refreshPupilRegisterCache(undefined)
        fail()
      } catch (error) {
        expect(error.message).toBe('School id not found in session')
      }
    })
    it('calls pupilRegisterV2Service getPupilRegisterViewData set when pupil register v2 is enabled ', async () => {
      spyOn(featureToggles, 'isFeatureEnabled').and.returnValue(true)
      spyOn(pupilRegisterV2Service, 'getPupilRegisterViewData')
      try {
        await pupilRegisterCachingService.refreshPupilRegisterCache(1)
      } catch (error) {
        fail()
      }
      expect(pupilRegisterV2Service.getPupilRegisterViewData).toHaveBeenCalled()
    })
    it('calls pupilRegisterService getPupilRegisterViewData set when pupil register v2 is not enabled ', async () => {
      spyOn(featureToggles, 'isFeatureEnabled').and.returnValue(false)
      spyOn(pupilRegisterService, 'getPupilRegisterViewData')
      try {
        await pupilRegisterCachingService.refreshPupilRegisterCache(1)
      } catch (error) {
        fail()
      }
      expect(pupilRegisterService.getPupilRegisterViewData).toHaveBeenCalled()
    })
  })
})
