'use strict'
/* global describe beforeEach expect it spyOn fail */

const pupilValidator = require('../../../lib/validator/pupil-validator')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const pupilAgeReasonDataService = require('../../../services/data-access/pupil-age-reason.data.service')
const ValidationError = require('../../../lib/validation-error')
const redisCacheService = require('../../../services/data-access/redis-cache.service')

let reqBody

describe('pupil-add-service', () => {
  const service = require('../../../services/pupil-add-service')

  const validationFunctionResolves = function () {
    return Promise.resolve(new ValidationError())
  }
  const validationFunctionThrows = function () {
    const validationError = new ValidationError()
    validationError.addError('upn', 'not good')
    return Promise.resolve(validationError)
  }

  beforeEach(() => {
    reqBody = {
      upn: 'L860100210012',
      foreName: 'test',
      lastName: 'test',
      foreNameAlias: 'test',
      lastNameAlias: 'test',
      middleNames: '',
      gender: 'M',
      'dob-month': '6',
      'dob-day': '30',
      'dob-year': '2009',
      ageReason: null
    }
  })

  describe('#addPupil', () => {
    it('throws if the school is not supplied', async () => {
      try {
        await service.addPupil(reqBody, undefined)
      } catch (error) {
        expect(error.message).toMatch(/Saving pupil failed/)
      }
    })

    it('throws if the pupil params are not supplied', async () => {
      try {
        await service.addPupil({}, 1)
      } catch (error) {
        expect(error.message).toMatch(/Saving pupil failed/)
      }
    })

    it('validates the pupil data', async () => {
      spyOn(pupilValidator, 'validate').and.callFake(validationFunctionResolves)
      spyOn(pupilDataService, 'sqlCreate').and.returnValue({ insertId: 1 })
      spyOn(pupilDataService, 'sqlFindOneById')
      spyOn(redisCacheService, 'drop')
      const schoolId = 999001
      try {
        await service.addPupil(reqBody, schoolId)
      } catch (error) {
        fail(error) // shouldn't throw
      }
    })

    it('throws a validation error if the pupil data does not validate', async () => {
      spyOn(pupilValidator, 'validate').and.callFake(validationFunctionThrows)
      const schoolId = 999001
      try {
        await service.addPupil(reqBody, schoolId)
        fail('expected to throw')
      } catch (error) {
        expect(error.name).toBe('ValidationError')
      }
    })

    it('saves the pupil data', async () => {
      spyOn(pupilValidator, 'validate').and.callFake(validationFunctionResolves)
      spyOn(pupilDataService, 'sqlCreate').and.returnValue({ insertId: 1 })
      spyOn(pupilDataService, 'sqlFindOneById')
      spyOn(pupilAgeReasonDataService, 'sqlInsertPupilAgeReason')
      spyOn(redisCacheService, 'drop')

      await service.addPupil(reqBody, 1234)
      expect(pupilDataService.sqlCreate).toHaveBeenCalledTimes(1)
      const saveArg = pupilDataService.sqlCreate.calls.argsFor(0)[0]

      // Check that the data of birth has been added
      expect(saveArg.dateOfBirth).toBeDefined()
      expect(saveArg.dateOfBirth.toISOString()).toBe('2009-06-30T00:00:00.000Z')

      // Check that the UI fields have been removed
      expect(saveArg['dob-day']).toBeUndefined()
      expect(saveArg['dob-month']).toBeUndefined()
      expect(saveArg['dob-year']).toBeUndefined()

      expect(pupilAgeReasonDataService.sqlInsertPupilAgeReason).not.toHaveBeenCalled()
    })

    it('calls sqlInsertPupilAgeReason before it saves the pupil data if ageReason is supplied', async () => {
      spyOn(pupilValidator, 'validate').and.callFake(validationFunctionResolves)
      spyOn(pupilDataService, 'sqlCreate').and.returnValue({ insertId: 1 })
      spyOn(pupilDataService, 'sqlFindOneById')
      spyOn(pupilAgeReasonDataService, 'sqlInsertPupilAgeReason')
      spyOn(redisCacheService, 'drop')
      reqBody.ageReason = 'reason'

      await service.addPupil(reqBody, 1234)

      expect(pupilDataService.sqlCreate).toHaveBeenCalled()
      const saveArg = pupilDataService.sqlCreate.calls.argsFor(0)[0]

      // Check that the data of birth has been added
      expect(saveArg.dateOfBirth).toBeDefined()
      expect(saveArg.dateOfBirth.toISOString()).toBe('2009-06-30T00:00:00.000Z')

      // Check that the UI fields have been removed
      expect(saveArg['dob-day']).toBeUndefined()
      expect(saveArg['dob-month']).toBeUndefined()
      expect(saveArg['dob-year']).toBeUndefined()
      expect(pupilAgeReasonDataService.sqlInsertPupilAgeReason).toHaveBeenCalled()
    })
  })
})
