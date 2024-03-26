import { PupilAnnulmentDataService } from './pupil-annulment.data.service'
import { AnnulmentType, PupilAnnulmentService } from './pupil-annulment.service'
const redisCacheService = require('../../data-access/redis-cache.service')
const redisKeyService = require('../../redis-key.service')

describe('pupil annulment service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('error is thrown if pupil identifier is not provided', async () => {
    // @ts-ignore:next-line assert if undefined handled correctly at runtime
    await expect(PupilAnnulmentService.applyAnnulment(undefined, 1, 2, AnnulmentType.PupilCheating)).rejects.toThrow('pupilUrlSlug is required')
  })

  test('error is thrown if annulment type is not provided', async () => {
    // @ts-ignore:next-line assert if undefined handled correctly at runtime
    await expect(PupilAnnulmentService.applyAnnulment('686bf762-35f4-45ce-aedf-f3ba01872663', 1, 2, undefined)).rejects.toThrow('annulmentType is required')
  })

  test('error is thrown if pupil identifier is invalid', async () => {
    const invalidUuid = 'sdlfjsdlfkjdskfljsdfkljsd'
    await expect(PupilAnnulmentService.applyAnnulment(invalidUuid, 1, 2, AnnulmentType.PupilCheating)).rejects.toThrow('a valid uuid is required for pupilUrlSlug')
  })

  test('appropriate cache changes are applied when applying an annulment', async () => {
    const pupilUrlSlug = '686bf762-35f4-45ce-aedf-f3ba01872663'
    const serviceManagerUserId = 555
    const pupilSchoolId = 945
    const annulmentType = AnnulmentType.Maladministration
    const pupilRegisterViewKey = redisKeyService.getPupilRegisterViewDataKey(pupilSchoolId)
    const schoolResultsKey = redisKeyService.getSchoolResultsKey(pupilSchoolId)
    jest.spyOn(redisCacheService, 'drop').mockImplementation()
    jest.spyOn(PupilAnnulmentDataService, 'setAnnulmentByUrlSlug').mockImplementation()
    await PupilAnnulmentService.applyAnnulment(pupilUrlSlug, serviceManagerUserId, pupilSchoolId, annulmentType)
    expect(redisCacheService.drop).toHaveBeenNthCalledWith(1, pupilRegisterViewKey)
    expect(redisCacheService.drop).toHaveBeenNthCalledWith(2, schoolResultsKey)
    expect(PupilAnnulmentDataService.setAnnulmentByUrlSlug).toHaveBeenCalledWith(pupilUrlSlug, serviceManagerUserId, annulmentType)
  })

  test('annulment type is set correctly (maladministration)', async () => {
    const pupilUrlSlug = '686bf762-35f4-45ce-aedf-f3ba01872663'
    const serviceManagerUserId = 555
    const pupilSchoolId = 945
    const annulmentType = AnnulmentType.Maladministration
    const pupilRegisterViewKey = redisKeyService.getPupilRegisterViewDataKey(pupilSchoolId)
    const schoolResultsKey = redisKeyService.getSchoolResultsKey(pupilSchoolId)
    jest.spyOn(redisCacheService, 'drop').mockImplementation()
    jest.spyOn(PupilAnnulmentDataService, 'setAnnulmentByUrlSlug').mockImplementation()
    await PupilAnnulmentService.applyAnnulment(pupilUrlSlug, serviceManagerUserId, pupilSchoolId, annulmentType)
    expect(redisCacheService.drop).toHaveBeenNthCalledWith(1, pupilRegisterViewKey)
    expect(redisCacheService.drop).toHaveBeenNthCalledWith(2, schoolResultsKey)
    expect(PupilAnnulmentDataService.setAnnulmentByUrlSlug).toHaveBeenCalledWith(pupilUrlSlug, serviceManagerUserId, annulmentType)
  })

  test('annulment type is set correctly (cheating)', async () => {
    const pupilUrlSlug = '686bf762-35f4-45ce-aedf-f3ba01872663'
    const serviceManagerUserId = 555
    const pupilSchoolId = 945
    const annulmentType = AnnulmentType.PupilCheating
    const pupilRegisterViewKey = redisKeyService.getPupilRegisterViewDataKey(pupilSchoolId)
    const schoolResultsKey = redisKeyService.getSchoolResultsKey(pupilSchoolId)
    jest.spyOn(redisCacheService, 'drop').mockImplementation()
    jest.spyOn(PupilAnnulmentDataService, 'setAnnulmentByUrlSlug').mockImplementation()
    await PupilAnnulmentService.applyAnnulment(pupilUrlSlug, serviceManagerUserId, pupilSchoolId, annulmentType)
    expect(redisCacheService.drop).toHaveBeenNthCalledWith(1, pupilRegisterViewKey)
    expect(redisCacheService.drop).toHaveBeenNthCalledWith(2, schoolResultsKey)
    expect(PupilAnnulmentDataService.setAnnulmentByUrlSlug).toHaveBeenCalledWith(pupilUrlSlug, serviceManagerUserId, annulmentType)
  })
})

describe('remove annulment', () => {
  test('error is thrown if pupil identifier is not specified', async () => {
    // @ts-ignore:next-line assert if undefined handled correctly at runtime
    await expect(PupilAnnulmentService.removeAnnulment(undefined, 1, 2)).rejects.toThrow('pupilUrlSlug is required')
  })

  test('error is thrown if pupil identifier is invalid', async () => {
    const invalidUuid = 'sdlfjsdlfkjdskfljsdfkljsd'
    await expect(PupilAnnulmentService.removeAnnulment(invalidUuid, 1, 2)).rejects.toThrow('a valid uuid is required for pupilUrlSlug')
  })

  test('appropriate services are called to undo annulment', async () => {
    const pupilUrlSlug = '21fd51ab-0c40-4da4-8be5-97360f8a4829'
    const serviceManagerUserId = 4545
    const pupilSchoolId = 9345
    const pupilRegisterViewKey = redisKeyService.getPupilRegisterViewDataKey(pupilSchoolId)
    const schoolResultsKey = redisKeyService.getSchoolResultsKey(pupilSchoolId)
    jest.spyOn(redisCacheService, 'drop').mockImplementation()
    jest.spyOn(PupilAnnulmentDataService, 'undoAnnulmentByUrlSlug').mockImplementation()
    await PupilAnnulmentService.removeAnnulment(pupilUrlSlug, serviceManagerUserId, pupilSchoolId)
    expect(redisCacheService.drop).toHaveBeenCalledWith(pupilRegisterViewKey)
    expect(redisCacheService.drop).toHaveBeenCalledWith(schoolResultsKey)
    expect(PupilAnnulmentDataService.undoAnnulmentByUrlSlug).toHaveBeenCalledWith(pupilUrlSlug, serviceManagerUserId)
  })
})
