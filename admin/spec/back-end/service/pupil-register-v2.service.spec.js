'use strict'

const pupilRegisterV2Service = require('../../../services/pupil-register-v2.service')
const pupilRegisterV2DataService = require('../../../services/data-access/pupil-register-v2.data.service')
const pupilIdentificationFlagService = require('../../../services/pupil-identification-flag.service')
const redisCacheService = require('../../../services/data-access/redis-cache.service')

describe('pupil-register-v2.service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('#getPupilRegister', () => {
    beforeEach(() => {
      jest.spyOn(pupilRegisterV2Service, 'getPupilRegisterViewData').mockImplementation()
    })

    test('throws an error if no school password is provided', async () => {
      jest.spyOn(redisCacheService, 'get').mockImplementation()
      try {
        await pupilRegisterV2Service.getPupilRegister(undefined)
        fail()
      } catch (error) {
        expect(error.message).toBe('School id not found in session')
      }
      expect(redisCacheService.get).not.toHaveBeenCalled()
    })

    test('calls redisCacheService get if school is provided', async () => {
      jest.spyOn(redisCacheService, 'get').mockReturnValue([{ id: 1 }])
      await pupilRegisterV2Service.getPupilRegister(42)
      expect(redisCacheService.get).toHaveBeenCalled()
    })

    test('does not call getPupilRegisterViewData if there are results from redis', async () => {
      jest.spyOn(redisCacheService, 'get').mockReturnValue([{ id: 1 }])
      await pupilRegisterV2Service.getPupilRegister(42)
      expect(pupilRegisterV2Service.getPupilRegisterViewData).not.toHaveBeenCalled()
    })

    test('calls the getPupilRegisterViewData if there is no result from redis', async () => {
      jest.spyOn(redisCacheService, 'get').mockImplementation()
      await pupilRegisterV2Service.getPupilRegister(42)
      expect(pupilRegisterV2Service.getPupilRegisterViewData).toHaveBeenCalled()
    })
  })

  describe('#getPupilRegisterViewData', () => {
    beforeEach(() => {
      jest.spyOn(pupilRegisterV2DataService, 'getPupilRegister').mockReturnValue([])
      jest.spyOn(pupilIdentificationFlagService, 'sortAndAddIdentificationFlags')
      jest.spyOn(redisCacheService, 'set').mockImplementation()
    })

    test('calls the pupil register data service to get the raw data', async () => {
      await pupilRegisterV2Service.getPupilRegisterViewData(42, 'key')
      expect(pupilRegisterV2DataService.getPupilRegister).toHaveBeenCalled()
    })

    test('calls the pupil register identification flag service to get the view data', async () => {
      await pupilRegisterV2Service.getPupilRegisterViewData(42, 'key')
      expect(pupilIdentificationFlagService.sortAndAddIdentificationFlags).toHaveBeenCalled()
    })

    test('calls the redis cache service to cache the view data for the particular school', async () => {
      await pupilRegisterV2Service.getPupilRegisterViewData(42, 'key')
      expect(redisCacheService.set).toHaveBeenCalled()
    })
  })
})
