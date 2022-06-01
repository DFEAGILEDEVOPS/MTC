/* global describe test expect beforeEach jest afterAll */

const dateService = require('../../../services/date.service')
const pupilMock = require('../mocks/pupil')
const pupilAgeReasonService = require('../../../services/pupil-age-reason.service')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const pupilEditService = require('../../../services/pupil-edit.service')
const redisCacheService = require('../../../services/data-access/redis-cache.service')
const { PupilFrozenService } = require('../../../services/pupil-frozen.service/pupil-frozen.service')

describe('pupilEditService', () => {
  beforeEach(() => {
    jest.spyOn(pupilAgeReasonService, 'refreshPupilAgeReason').mockImplementation()
    jest.spyOn(pupilDataService, 'sqlUpdate').mockImplementation()
    jest.spyOn(dateService, 'createUTCFromDayMonthYear').mockImplementation()
    jest.spyOn(redisCacheService, 'drop').mockImplementation()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  const requestBody = {
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

  test('should call refreshPupilAgeReason', async () => {
    jest.spyOn(PupilFrozenService, 'throwIfFrozen').mockResolvedValue()
    const pupil1 = Object.assign({}, pupilMock)
    const schoolId = 1
    await pupilEditService.update(pupil1, requestBody, schoolId)
    expect(pupilAgeReasonService.refreshPupilAgeReason).toHaveBeenCalled()
  })

  test('should call createUTCFromDayMonthYear', async () => {
    jest.spyOn(PupilFrozenService, 'throwIfFrozen').mockResolvedValue()
    const pupil1 = Object.assign({}, pupilMock)
    const schoolId = 1
    await pupilEditService.update(pupil1, requestBody, schoolId)
    expect(dateService.createUTCFromDayMonthYear).toHaveBeenCalled()
  })

  test('should call sqlUpdate from the data service', async () => {
    jest.spyOn(PupilFrozenService, 'throwIfFrozen').mockResolvedValue()
    const pupil1 = Object.assign({}, pupilMock)
    const schoolId = 1
    await pupilEditService.update(pupil1, requestBody, schoolId)
    expect(pupilDataService.sqlUpdate).toHaveBeenCalled()
  })

  test('should drop pupil register cache', async () => {
    jest.spyOn(PupilFrozenService, 'throwIfFrozen').mockResolvedValue()
    const pupil1 = Object.assign({}, pupilMock)
    const schoolId = 1
    await pupilEditService.update(pupil1, requestBody, schoolId)
    expect(redisCacheService.drop).toHaveBeenCalled()
  })

  test('should throw an error if pupil frozen', async () => {
    jest.spyOn(PupilFrozenService, 'throwIfFrozen').mockImplementation(() => {
      throw new Error('frozen')
    })
    const pupil1 = Object.assign({}, pupilMock)
    const schoolId = 1
    await expect(pupilEditService.update(pupil1, requestBody, schoolId)).rejects.toThrow('frozen')
  })
})
