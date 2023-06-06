'use strict'
/* global describe beforeEach expect test afterEach jest fail */

const pupilValidator = require('../../../lib/validator/pupil-validator')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const pupilAgeReasonDataService = require('../../../services/data-access/pupil-age-reason.data.service')
const ValidationError = require('../../../lib/validation-error')
const redisCacheService = require('../../../services/data-access/redis-cache.service')

let reqBody

describe('pupil-add-service', () => {
  const service = require('../../../services/pupil-add-service')

  const validationFunctionSucceeds = function () {
    return Promise.resolve(new ValidationError())
  }
  const validationFunctionFails = function () {
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

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const schoolId = 1
  const userId = 2

  describe('#addPupil', () => {
    test('throws if the school is not supplied', async () => {
      await expect(service.addPupil(reqBody, undefined, userId)).rejects.toThrow('schoolId is required')
    })

    test('throws if pupilData does not have required number of properties', async () => {
      await expect(service.addPupil({}, schoolId, userId)).rejects.toThrow('pupilData is required')
    })

    test('throws if pupilData is undefined', async () => {
      await expect(service.addPupil(undefined, schoolId, userId)).rejects.toThrow('pupilData is required')
    })

    test('throws if the userId is not supplied', async () => {
      await expect(service.addPupil(reqBody, schoolId, undefined)).rejects.toThrow('userId is required')
    })

    test('validates the pupil data', async () => {
      jest.spyOn(pupilValidator, 'validate').mockImplementation(validationFunctionSucceeds)
      jest.spyOn(pupilDataService, 'sqlCreate').mockResolvedValue({ insertId: 1 })
      jest.spyOn(pupilDataService, 'sqlFindOneById').mockImplementation()
      jest.spyOn(redisCacheService, 'drop').mockImplementation()
      const schoolId = 999001
      await service.addPupil(reqBody, schoolId, userId)
      expect(pupilValidator.validate).toHaveBeenCalled()
    })

    test('throws a validation error if the pupil data does not validate', async () => {
      jest.spyOn(pupilValidator, 'validate').mockImplementation(validationFunctionFails)
      const schoolId = 999001
      try {
        await service.addPupil(reqBody, schoolId, userId)
        fail('expected to throw')
      } catch (error) {
        expect(error.name).toBe('ValidationError')
      }
    })

    test('saves the pupil data', async () => {
      jest.spyOn(pupilValidator, 'validate').mockImplementation(validationFunctionSucceeds)
      jest.spyOn(pupilDataService, 'sqlCreate').mockResolvedValue({ insertId: 1 })
      jest.spyOn(pupilDataService, 'sqlFindOneById').mockImplementation()
      jest.spyOn(pupilAgeReasonDataService, 'sqlInsertPupilAgeReason').mockImplementation()
      jest.spyOn(redisCacheService, 'drop').mockImplementation()

      await service.addPupil(reqBody, schoolId, userId)
      expect(pupilDataService.sqlCreate).toHaveBeenCalledTimes(1)
      const saveArg = pupilDataService.sqlCreate.mock.calls[0][0]

      // Check that the data of birth has been added
      expect(saveArg.dateOfBirth).toBeDefined()
      expect(saveArg.dateOfBirth.toISOString()).toBe('2009-06-30T00:00:00.000Z')

      // Check that the UI fields have been removed
      expect(saveArg['dob-day']).toBeUndefined()
      expect(saveArg['dob-month']).toBeUndefined()
      expect(saveArg['dob-year']).toBeUndefined()

      expect(pupilAgeReasonDataService.sqlInsertPupilAgeReason).not.toHaveBeenCalled()
    })

    test('calls sqlInsertPupilAgeReason before it saves the pupil data if ageReason is supplied', async () => {
      jest.spyOn(pupilValidator, 'validate').mockImplementation(validationFunctionSucceeds)
      jest.spyOn(pupilDataService, 'sqlCreate').mockResolvedValue({ insertId: 1 })
      jest.spyOn(pupilDataService, 'sqlFindOneById').mockImplementation()
      jest.spyOn(pupilAgeReasonDataService, 'sqlInsertPupilAgeReason').mockImplementation()
      jest.spyOn(redisCacheService, 'drop').mockImplementation()
      reqBody.ageReason = 'reason'

      await service.addPupil(reqBody, schoolId, userId)

      expect(pupilDataService.sqlCreate).toHaveBeenCalled()
      const saveArg = pupilDataService.sqlCreate.mock.calls[0][0]

      // Check that the data of birth has been added
      expect(saveArg.dateOfBirth).toBeDefined()
      expect(saveArg.dateOfBirth.toISOString()).toBe('2009-06-30T00:00:00.000Z')

      // Check that the UI fields have been removed
      expect(saveArg['dob-day']).toBeUndefined()
      expect(saveArg['dob-month']).toBeUndefined()
      expect(saveArg['dob-year']).toBeUndefined()
      expect(pupilAgeReasonDataService.sqlInsertPupilAgeReason).toHaveBeenCalled()
    })

    test('validates the UPN with the trimmed and uppercased UPN', async () => {
      jest.spyOn(pupilValidator, 'validate').mockImplementation(validationFunctionSucceeds)
      jest.spyOn(pupilDataService, 'sqlCreate').mockResolvedValue({ insertId: 1 })
      jest.spyOn(pupilDataService, 'sqlFindOneById').mockImplementation()
      jest.spyOn(pupilAgeReasonDataService, 'sqlInsertPupilAgeReason').mockImplementation()
      jest.spyOn(redisCacheService, 'drop').mockImplementation()
      reqBody.ageReason = 'reason'
      reqBody.upn = ' l860100210012 ' // what the user typed into the form
      const transformedUPN = 'L860100210012' // what is expected to get passed to the validator and the sqlCreate functions
      await service.addPupil(reqBody, schoolId, userId)
      expect(pupilValidator.validate).toHaveBeenCalled()
      const validationArgs = pupilValidator.validate.mock.calls[0]
      expect(validationArgs[0].upn).toBe(transformedUPN)
      const sqlCreateArgs = pupilDataService.sqlCreate.mock.calls[0]
      expect(sqlCreateArgs[0].upn).toBe(transformedUPN) // the DB should get the same transformed upn
    })
  })
})
