'use strict'

/* global describe expect it beforeEach spyOn */

const pupilRegisterCachingService = require('../../../services/pupil-register-caching.service')
const pupilRegisterV2Service = require('../../../services/pupil-register-v2.service')
const pupilIdentificationFlagService = require('../../../services/pupil-identification-flag.service')
const redisCacheService = require('../../../services/data-access/redis-cache.service')
const tableSorting = require('../../../helpers/table-sorting')

describe('pupil-register-v2.service', () => {
  describe('#getPupilRegister', () => {
    beforeEach(() => {
      spyOn(pupilRegisterCachingService, 'setPupilRegisterCache').and.returnValue([])
      spyOn(pupilIdentificationFlagService, 'addIdentificationFlags')
      spyOn(tableSorting, 'applySorting')
    })
    it('calls redis cache service to get the cached data', async () => {
      spyOn(redisCacheService, 'get').and.returnValue(JSON.stringify([{ id: 1 }, { id: 2 }]))
      await pupilRegisterV2Service.getPupilRegister(42)
      expect(redisCacheService.get).toHaveBeenCalled()
      // noinspection ES6MissingAwait
      expect(pupilRegisterCachingService.setPupilRegisterCache).not.toHaveBeenCalled()
    })
    it('calls the data service to get the raw data if redis does not retrieve any data', async () => {
      spyOn(redisCacheService, 'get')
      await pupilRegisterV2Service.getPupilRegister(42)
      expect(redisCacheService.get).toHaveBeenCalled()
      expect(pupilRegisterCachingService.setPupilRegisterCache).toHaveBeenCalled()
    })
    it('calls the tableSorting helper to sort in an ascending by last name', async () => {
      spyOn(redisCacheService, 'get')
      await pupilRegisterV2Service.getPupilRegister(42)
      expect(tableSorting.applySorting).toHaveBeenCalledWith([], 'lastName')
    })
    it('calls the pupil identification flag service', async () => {
      spyOn(redisCacheService, 'get')
      await pupilRegisterV2Service.getPupilRegister(42)
      expect(pupilIdentificationFlagService.addIdentificationFlags).toHaveBeenCalled()
    })
  })
})
