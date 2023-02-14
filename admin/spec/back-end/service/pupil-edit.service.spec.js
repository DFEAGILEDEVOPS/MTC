/* global describe test expect beforeEach jest afterAll */

const dateService = require('../../../services/date.service')
const pupilMock = require('../mocks/pupil')
const pupilAgeReasonService = require('../../../services/pupil-age-reason.service')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const pupilEditService = require('../../../services/pupil-edit.service')
const redisCacheService = require('../../../services/data-access/redis-cache.service')
const { PupilFrozenService } = require('../../../services/pupil-frozen.service/pupil-frozen.service')

describe('pupilEditService', () => {
  let pupil1
  let requestBody

  beforeEach(() => {
    jest.spyOn(pupilAgeReasonService, 'refreshPupilAgeReason').mockImplementation()
    jest.spyOn(pupilDataService, 'sqlUpdate').mockImplementation()
    jest.spyOn(dateService, 'createUTCFromDayMonthYear').mockImplementation()
    jest.spyOn(redisCacheService, 'drop').mockImplementation()
    jest.spyOn(PupilFrozenService, 'throwIfFrozenByIds').mockResolvedValue()
    pupil1 = Object.assign({}, pupilMock)
    requestBody = {
      foreName: 'foreName',
      lastName: 'lastName',
      middleNames: 'middleNames',
      foreNameAlias: 'foreNameAlias',
      lastNameAlias: 'lastNameAlias',
      ageReason: 'reason',
      upn: 'upn',
      gender: 'M',
      'dob-day': 2,
      'dob-month': 10,
      'dob-year': 10
    }
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const userId = 1
  const schoolId = 2

  test('should call refreshPupilAgeReason', async () => {
    await pupilEditService.update(pupil1, requestBody, schoolId, userId)
    expect(pupilAgeReasonService.refreshPupilAgeReason).toHaveBeenCalled()
  })

  test('should call createUTCFromDayMonthYear', async () => {
    await pupilEditService.update(pupil1, requestBody, schoolId, userId)
    expect(dateService.createUTCFromDayMonthYear).toHaveBeenCalled()
  })

  test('should call sqlUpdate from the data service', async () => {
    await pupilEditService.update(pupil1, requestBody, schoolId, userId)
    expect(pupilDataService.sqlUpdate).toHaveBeenCalled()
  })

  test('should drop pupil register cache', async () => {
    await pupilEditService.update(pupil1, requestBody, schoolId, userId)
    expect(redisCacheService.drop).toHaveBeenCalled()
  })

  test('should throw an error if pupil frozen', async () => {
    jest.spyOn(PupilFrozenService, 'throwIfFrozenByIds').mockImplementation(() => {
      throw new Error('frozen')
    })
    await expect(pupilEditService.update(pupil1, requestBody, schoolId, userId)).rejects.toThrow('frozen')
  })

  test('should throw an error if userId not provided', async () => {
    await expect(pupilEditService.update(pupil1, requestBody, schoolId)).rejects.toThrow('userId is required')
  })

  test('should throw an error if schoolId not provided', async () => {
    await expect(pupilEditService.update(pupil1, requestBody, undefined, userId)).rejects.toThrow('schoolId is required')
  })

  test('should throw an error if pupil not provided', async () => {
    pupil1 = undefined
    await expect(pupilEditService.update(pupil1, requestBody, schoolId, userId)).rejects.toThrow('pupil is required')
  })

  test('it should not update the pupil age reason unless it has been modified', async () => {
    pupil1.ageReason = 'existing age reason'
    requestBody.ageReason = 'existing age reason' // not modified in pupil edit screen
    await pupilEditService.update(pupil1, requestBody, schoolId, userId)
    expect(pupilAgeReasonService.refreshPupilAgeReason).not.toHaveBeenCalled()
  })
})
