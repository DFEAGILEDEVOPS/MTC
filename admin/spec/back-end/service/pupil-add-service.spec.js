'use strict'
/* global describe beforeEach afterEach expect it spyOn fail */

const sinon = require('sinon')
const proxyquire = require('proxyquire').noCallThru()
const pupilValidator = require('../../../lib/validator/pupil-validator')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const pupilAgeReasonDataService = require('../../../services/data-access/pupil-age-reason.data.service')
const ValidationError = require('../../../lib/validation-error')
const sqlResponse = require('../mocks/sql-modify-response')
const pupilMock = require('../mocks/pupil')
const redisCacheService = require('../../../services/data-access/redis-cache.service')
const redisKeyService = require('../../../services/redis-key.service')

let pupilData

describe('pupil-add-service', () => {
  let sandbox, service, pupilValidatorSpy, saveSpy
  const validationFunctionResolves = function () {
    return Promise.resolve(new ValidationError())
  }
  const validationFunctionThrows = function () {
    const validationError = new ValidationError()
    validationError.addError('upn', 'not good')
    return Promise.resolve(validationError)
  }

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    pupilData = {
      school: 9991001,
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
      pin: null,
      pinExpired: false,
      ageReason: null
    }
  })

  function getService (validationFn) {
    pupilValidatorSpy = sandbox.stub(pupilValidator, 'validate').callsFake(validationFn)
    saveSpy = sandbox.stub(pupilDataService, 'sqlCreate').resolves(sqlResponse)
    spyOn(pupilDataService, 'sqlFindOneById').and.returnValue(pupilMock)
    spyOn(pupilAgeReasonDataService, 'sqlInsertPupilAgeReason')
    spyOn(redisCacheService, 'drop')
    spyOn(redisKeyService, 'getPupilRegisterViewDataKey')
    service = proxyquire('../../../services/pupil-add-service', {
      '../lib/validator/pupil-validator': pupilValidator
    })
    return service
  }

  afterEach(() => {
    sandbox.restore()
  })

  it('validates the pupil data', async (done) => {
    service = getService(validationFunctionResolves)
    const schoolId = 999001
    await service.addPupil(pupilData, schoolId)
    expect(pupilValidatorSpy.called).toBeTruthy()
    done()
  })

  it('throws a validation error if the pupil data does not validate', async (done) => {
    service = getService(validationFunctionThrows)
    try {
      await service.addPupil(pupilData)
      expect('this').toBe('thrown')
    } catch (error) {
      expect(error.name).toBe('Error')
    }
    done()
  })

  it('saves the pupil data', async (done) => {
    service = getService(validationFunctionResolves)
    try {
      await service.addPupil(pupilData, 1234)
      expect(saveSpy.calledOnce).toBeTruthy()
      const saveArg = saveSpy.args[0][0]
      // Check that the data of birth has been added
      expect(saveArg.dateOfBirth).toBeDefined()
      expect(saveArg.dateOfBirth.toISOString()).toBe('2009-06-30T00:00:00.000Z')
      // Check that the UI fields have been removed
      expect(saveArg['dob-day']).toBeUndefined()
      expect(saveArg['dob-month']).toBeUndefined()
      expect(saveArg['dob-year']).toBeUndefined()
      expect(pupilAgeReasonDataService.sqlInsertPupilAgeReason).not.toHaveBeenCalled()
    } catch (error) {
      expect('Error: Invalid req.body and/or school id. Saving pupil failed.').toBe(error.toString())
    }
    done()
  })

  it('calls sqlInsertPupilAgeReason before it saves the pupil data if ageReason is supplied', async (done) => {
    service = getService(validationFunctionResolves)
    try {
      pupilData.ageReason = 'reason'
      await service.addPupil(pupilData, 1234)
      expect(saveSpy.calledOnce).toBeTruthy()
      const saveArg = saveSpy.args[0][0]
      // Check that the data of birth has been added
      expect(saveArg.dateOfBirth).toBeDefined()
      expect(saveArg.dateOfBirth.toISOString()).toBe('2009-06-30T00:00:00.000Z')
      // Check that the UI fields have been removed
      expect(saveArg['dob-day']).toBeUndefined()
      expect(saveArg['dob-month']).toBeUndefined()
      expect(saveArg['dob-year']).toBeUndefined()
      expect(pupilAgeReasonDataService.sqlInsertPupilAgeReason).toHaveBeenCalled()
    } catch (error) {
      expect('Error: Invalid req.body and/or school id. Saving pupil failed.').toBe(error.toString())
    }
    done()
  })

  it('does not save the pupil data if arguments are missing', async (done) => {
    service = getService(validationFunctionResolves)
    try {
      await service.addPupil(pupilData, 1234)
      expect(saveSpy.calledOnce).toBeTruthy()
      const saveArg = saveSpy.args[0][0]
      // Check that the data of birth has been added
      expect(saveArg.dateOfBirth).toBeDefined()
      expect(saveArg.dateOfBirth.toISOString()).toBe('2009-06-30T00:00:00.000Z')
      // check that the UI fields have been removed
      expect(saveArg['dob-day']).toBeUndefined()
      expect(saveArg['dob-month']).toBeUndefined()
      expect(saveArg['dob-year']).toBeUndefined()
      expect(pupilAgeReasonDataService.sqlInsertPupilAgeReason).not.toHaveBeenCalled()
    } catch (error) {
      fail('not expected to throw')
    }
    done()
  })
})
