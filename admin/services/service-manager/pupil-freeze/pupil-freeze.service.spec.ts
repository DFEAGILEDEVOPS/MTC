import { PupilFreezeService } from './pupil-freeze.service'
import { PupilFreezeDataService } from './pupil-freeze.data.service'
const redisKeyService = require('../../redis-key.service')
const redisCacheService = require('../../data-access/redis-cache.service')

describe('PupilFreezeService', () => {
  const sut = PupilFreezeService

  beforeEach(() => {
    jest.spyOn(PupilFreezeDataService, 'setFreezeFlag').mockImplementation()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  describe('applyFreeze', () => {
    test('it throws if the pupil slug is not provided', async () => {
      // @ts-ignore:next-line assert if undefined handled correctly at runtime
      await expect(sut.applyFreeze()).rejects.toThrow('pupilUrlSlug is required')
    })

    test('error is thrown if pupil identifier is invalid', async () => {
      const invalidUuid = 'sdlfjsdlfkjdskfljsdfkljsd'
      await expect(sut.applyFreeze(invalidUuid, 1, 3)).rejects.toThrow('a valid uuid is required for pupilUrlSlug')
    })

    test('appropriate services are called to apply annulment', async () => {
      const pupilUrlSlug = '686bf762-35f4-45ce-aedf-f3ba01872663'
      const serviceManagerUserId = 555
      const pupilSchoolId = 945
      const pupilRegisterViewKey = redisKeyService.getPupilRegisterViewDataKey(pupilSchoolId)
      const schoolResultsKey = redisKeyService.getSchoolResultsKey(pupilSchoolId)
      jest.spyOn(redisCacheService, 'drop').mockImplementation()
      jest.spyOn(PupilFreezeDataService, 'setFreezeFlag').mockImplementation()
      await PupilFreezeService.applyFreeze(pupilUrlSlug, serviceManagerUserId, pupilSchoolId)
      expect(redisCacheService.drop).toHaveBeenNthCalledWith(1, pupilRegisterViewKey)
      expect(redisCacheService.drop).toHaveBeenNthCalledWith(2, schoolResultsKey)
      expect(PupilFreezeDataService.setFreezeFlag).toHaveBeenCalledWith(pupilUrlSlug, serviceManagerUserId)
    })
  })
})
