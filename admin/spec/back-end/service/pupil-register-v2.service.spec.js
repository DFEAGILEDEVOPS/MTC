'use strict'

/* global describe expect it beforeEach spyOn fail */

const pupilRegisterV2Service = require('../../../services/pupil-register-v2.service')
const pupilRegisterV2DataService = require('../../../services/data-access/pupil-register-v2.data.service')
const pupilIdentificationFlagService = require('../../../services/pupil-identification-flag.service')
const redisCacheService = require('../../../services/data-access/redis-cache.service')
const tableSorting = require('../../../helpers/table-sorting')

describe('pupil-register-v2.service', () => {
  describe('#getPupilRegister', () => {
    beforeEach(() => {
      spyOn(pupilRegisterV2Service, 'getPupilRegisterViewData')
    })
    it('throws an error if no school password is provided', async () => {
      spyOn(redisCacheService, 'get')
      try {
        await pupilRegisterV2Service.getPupilRegister(undefined)
        fail()
      } catch (error) {
        expect(error.message).toBe('School id not found in session')
      }
      expect(redisCacheService.get).not.toHaveBeenCalled()
    })
    it('calls redisCacheService get if school is provided', async () => {
      spyOn(redisCacheService, 'get').and.returnValue([{ id: 1 }])
      await pupilRegisterV2Service.getPupilRegister(42)
      expect(redisCacheService.get).toHaveBeenCalled()
    })
    it('does not call getPupilRegisterViewData if there are results from redis', async () => {
      spyOn(redisCacheService, 'get').and.returnValue([{ id: 1 }])
      await pupilRegisterV2Service.getPupilRegister(42)
      expect(pupilRegisterV2Service.getPupilRegisterViewData).not.toHaveBeenCalled()
    })
    it('calls the getPupilRegisterViewData if there is no result from redis', async () => {
      spyOn(redisCacheService, 'get')
      await pupilRegisterV2Service.getPupilRegister(42)
      expect(pupilRegisterV2Service.getPupilRegisterViewData).toHaveBeenCalled()
    })
  })

  describe('#getPupilRegisterViewData', () => {
    beforeEach(() => {
      spyOn(pupilRegisterV2DataService, 'getPupilRegister').and.returnValue([])
      spyOn(pupilIdentificationFlagService, 'addIdentificationFlags')
      spyOn(tableSorting, 'applySorting')
      spyOn(redisCacheService, 'set')
    })
    it('calls the pupil register data service to get the raw data', async () => {
      await pupilRegisterV2Service.getPupilRegisterViewData(42, 'key')
      expect(pupilRegisterV2DataService.getPupilRegister).toHaveBeenCalled()
    })
    it('calls the tableSorting applySorting method to sort the raw data', async () => {
      await pupilRegisterV2Service.getPupilRegisterViewData(42, 'key')
      expect(tableSorting.applySorting).toHaveBeenCalled()
    })
    it('calls the pupil register identification flag service to get the view data', async () => {
      await pupilRegisterV2Service.getPupilRegisterViewData(42, 'key')
      expect(pupilIdentificationFlagService.addIdentificationFlags).toHaveBeenCalled()
    })
    it('calls the redis cache service to cache the view data for the particular school', async () => {
      await pupilRegisterV2Service.getPupilRegisterViewData(42, 'key')
      expect(redisCacheService.set).toHaveBeenCalled()
    })
  })
})
