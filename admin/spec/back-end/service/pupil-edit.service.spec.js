/* global describe, it, expect beforeEach spyOn */

const dateService = require('../../../services/date.service')
const pupilMock = require('../mocks/pupil')
const pupilAgeReasonService = require('../../../services/pupil-age-reason.service')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const pupilEditService = require('../../../services/pupil-edit.service')
const redisCacheService = require('../../../services/data-access/redis-cache.service')

describe('pupilEditService', () => {
  beforeEach(() => {
    spyOn(pupilAgeReasonService, 'refreshPupilAgeReason')
    spyOn(pupilDataService, 'sqlUpdate')
    spyOn(dateService, 'createUTCFromDayMonthYear')
    spyOn(redisCacheService, 'drop')
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
  it('should call refreshPupilAgeReason', async () => {
    const pupil1 = Object.assign({}, pupilMock)
    const schoolId = 1
    await pupilEditService.update(pupil1, requestBody, schoolId)
    expect(pupilAgeReasonService.refreshPupilAgeReason).toHaveBeenCalled()
  })
  it('should call createUTCFromDayMonthYear', async () => {
    const pupil1 = Object.assign({}, pupilMock)
    const schoolId = 1
    await pupilEditService.update(pupil1, requestBody, schoolId)
    expect(dateService.createUTCFromDayMonthYear).toHaveBeenCalled()
  })
  it('should call sqlUpdate from the data service', async () => {
    const pupil1 = Object.assign({}, pupilMock)
    const schoolId = 1
    await pupilEditService.update(pupil1, requestBody, schoolId)
    expect(pupilDataService.sqlUpdate).toHaveBeenCalled()
  })
  it('should drop pupil register cache', async () => {
    const pupil1 = Object.assign({}, pupilMock)
    const schoolId = 1
    await pupilEditService.update(pupil1, requestBody, schoolId)
    expect(redisCacheService.drop).toHaveBeenCalled()
  })
})
