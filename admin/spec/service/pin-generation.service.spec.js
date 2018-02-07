'use strict'
/* global describe, beforeEach, afterEach, it, expect, spyOn, fail */

const proxyquire = require('proxyquire').noCallThru()
const moment = require('moment')
const sinon = require('sinon')
const pupilDataService = require('../../services/data-access/pupil.data.service')
const checkDataService = require('../../services/data-access/check.data.service')
const pupilAttendanceDataService = require('../../services/data-access/pupil-attendance.data.service')
const pinGenerationService = require('../../services/pin-generation.service')
const restartService = require('../../services/restart.service')

const pupilMock = require('../mocks/pupil')
const schoolMock = require('../mocks/school')

describe('pin-generation.service', () => {
  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('getPupils', () => {
    describe('returns pupils', () => {
      beforeEach(() => {
        const pupil1 = Object.assign({}, pupilMock)
        pupil1.pin = ''
        const pupil2 = Object.assign({}, pupilMock)
        pupil2.id = '595cd5416e5ca13e48ed2520'
        pupil2.pin = ''
        pupil1.foreName = 'foreName'
        pupil1.lastName = 'lastName'
        sandbox.mock(pupilDataService).expects('sqlFindPupilsByDfeNumber').resolves([ pupil1, pupil2 ])
        sandbox.mock(checkDataService).expects('sqlFindNumberOfChecksStartedByPupil').resolves(0).twice()
        sandbox.mock(restartService).expects('canRestart').resolves(false).twice()
        sandbox.mock(pupilAttendanceDataService).expects('findOneByPupilId').resolves({}).twice()
        proxyquire('../../services/pin-generation.service', {
          '../../services/pupil.service': pupilDataService,
          '../../services/restart.service': restartService,
          '../../services/data-access/check.data.service': checkDataService
        })
      })
      it('with specific properties', async (done) => {
        const pupils = await pinGenerationService.getPupils(schoolMock.id, 'lastName', 'asc')
        expect(pupils.length).toBe(2)
        expect(Object.keys(pupils[ 0 ]).length).toBe(7)
        done()
      })
    })

    describe('filter and returns sorted pupils', () => {
      beforeEach(() => {
        const pupil1 = Object.assign({}, pupilMock)
        pupil1.pin = ''
        const pupil2 = Object.assign({}, pupilMock)
        pupil2.id = '595cd5416e5ca13e48ed2520'
        pupil2.pin = 'f55sg'
        pupil2.pinExpiresAt = moment().startOf('day').add(16, 'hours')
        sandbox.mock(pupilDataService).expects('sqlFindPupilsByDfeNumber').resolves([ pupil1, pupil2 ])
        sandbox.mock(checkDataService).expects('sqlFindNumberOfChecksStartedByPupil').resolves(0).twice()
        sandbox.mock(restartService).expects('canRestart').resolves(false).twice()
        sandbox.mock(pupilAttendanceDataService).expects('findOneByPupilId').resolves({}).twice()
        sandbox.useFakeTimers(moment().startOf('day'))
        proxyquire('../../services/pin-generation.service', {
          '../../services/pupil.service': pupilDataService,
          '../../services/restart.service': restartService,
          '../../services/data-access/check.data.service': checkDataService
        })
      })
      it('without expired pins', async (done) => {
        const pupils = await pinGenerationService.getPupils(schoolMock.id, 'lastName', 'asc')
        expect(pupils.length).toBe(1)
        done()
      })
    })

    describe('filters pupils who reached the max number of attempts and cant restart', () => {
      beforeEach(() => {
        const pupil1 = Object.assign({}, pupilMock)
        pupil1.pin = ''
        const pupil2 = Object.assign({}, pupilMock)
        pupil2.id = '595cd5416e5ca13e48ed2520'
        pupil2.pin = 'f55sg'
        pupil2.pinExpiresAt = moment().startOf('day').add(16, 'hours')
        sandbox.mock(pupilDataService).expects('sqlFindPupilsByDfeNumber').resolves([ pupil1, pupil2 ])
        sandbox.mock(checkDataService).expects('sqlFindNumberOfChecksStartedByPupil').resolves(3).twice()
        sandbox.mock(restartService).expects('canRestart').resolves(false).twice()
        sandbox.mock(pupilAttendanceDataService).expects('findOneByPupilId').resolves({}).twice()
        sandbox.useFakeTimers(moment().startOf('day'))
        proxyquire('../../services/pin-generation.service', {
          '../../services/pupil.service': pupilDataService,
          '../../services/restart.service': restartService,
          '../../services/data-access/check.data.service': checkDataService
        })
      })
      it('without expired pins', async (done) => {
        const pupils = await pinGenerationService.getPupils(schoolMock.id, 'lastName', 'asc')
        expect(pupils.length).toBe(0)
        done()
      })
    })

    describe('pupils with same fullname', () => {
      beforeEach(() => {
        const pupil1 = Object.assign({}, pupilMock)
        pupil1.pin = ''
        const pupil2 = Object.assign({}, pupilMock)
        pupil2.id = '595cd5416e5ca13e48ed2520'
        pupil2.pin = ''
        pupil2.foreName = pupil1.foreName
        pupil2.lastName = pupil1.lastName
        sandbox.mock(pupilDataService).expects('sqlFindPupilsByDfeNumber').resolves([ pupil1, pupil2 ])
        sandbox.mock(checkDataService).expects('sqlFindNumberOfChecksStartedByPupil').resolves(0).twice()
        sandbox.mock(restartService).expects('canRestart').resolves(false).twice()
        sandbox.mock(pupilAttendanceDataService).expects('findOneByPupilId').resolves({}).twice()
        proxyquire('../../services/pin-generation.service', {
          '../../services/pupil.service': pupilDataService,
          '../../services/restart.service': restartService,
          '../../services/data-access/check.data.service': checkDataService
        })
      })
      it('should display DoB', async (done) => {
        const pupils = await pinGenerationService.getPupils(schoolMock.id, 'lastName', 'asc')
        expect(pupils.length).toBe(2)
        expect(pupils[ 0 ].showDoB).toBeTruthy()
        expect(pupils[ 1 ].showDoB).toBeTruthy()
        done()
      })
      it('should display middle names', async (done) => {
        const pupils = await pinGenerationService.getPupils(schoolMock.id, 'lastName', 'asc')
        expect(pupils.length).toBe(2)
        expect(pupils[ 0 ].showMiddleNames).toBeTruthy()
        expect(pupils[ 1 ].showMiddleNames).toBeTruthy()
        done()
      })
    })
    describe('does not return pupils', () => {
      it('who are flagged as not taking the check', async (done) => {
        const pupil1 = Object.assign({}, pupilMock)
        pupil1.pin = ''
        const pupilAttendanceMock = {
          id: 'id',
          createdAt: moment.utc(),
          updatedAt: moment.utc(),
          recordedByUser_id: 1,
          attendanceCode_id: 1,
          pupil_id: 10
        }
        spyOn(pupilDataService, 'sqlFindPupilsByDfeNumber').and.returnValue([pupil1])
        spyOn(checkDataService, 'sqlFindNumberOfChecksStartedByPupil').and.returnValue(0)
        spyOn(restartService, 'canRestart').and.returnValue(false)
        spyOn(pupilAttendanceDataService, 'findOneByPupilId').and.returnValue(pupilAttendanceMock)
        const pupils = await pinGenerationService.getPupils(schoolMock.id, 'lastName', 'asc')
        expect(pupils.length).toBe(0)
        done()
      })
    })
  })

  describe('updatePupilPins', () => {
    let pupilArray, duplicateKeyError
    beforeEach(() => {
      pupilArray = []
      for (let i = 0; i <= 5; i++) {
        const pupil = Object.assign({}, pupilMock)
        pupil.id = i + 1
        pupil.pin = undefined
        pupil.pinExpiresAt = undefined
        pupilArray.push(pupil)
      }
      duplicateKeyError = `Cannot insert duplicate key row in object 'mtc_admin.pupil' 
        with unique index 'pupil_school_id_pin_uindex'.`
    })
    describe('should generate pin and execute update', () => {
      it('when pin has not been generated', async () => {
        spyOn(pupilDataService, 'sqlUpdatePinsBatch')
        spyOn(pupilDataService, 'sqlFindByIds').and.callFake((list) => pupilArray.filter(p => list.includes(p.id)))
        const submittedIds = pupilArray.map(p => p.id)
        await pinGenerationService.updatePupilPins(submittedIds, 9991999)
        const data = pupilArray.map(p => ({ id: p.id, pin: p.pin, pinExpiresAt: p.pinExpiresAt }))
        expect(pupilDataService.sqlUpdatePinsBatch).toHaveBeenCalledWith(data)
        expect(pupilDataService.sqlUpdatePinsBatch).toHaveBeenCalledTimes(1)
      })
    })
    describe('should retry generating existing pins', () => {
      it('when sqlUpdatePinsBatch throws duplicate key error and max attempts are not reached', async () => {
        pinGenerationService.pinSubmissionMaxAttempts = 5
        pinGenerationService.pinSubmissionAttempts = 0
        const sqlFindByIdsSpy = spyOn(pupilDataService, 'sqlFindByIds')
        sqlFindByIdsSpy.and.callFake((list) => pupilArray.filter(p => list.includes(p.id)))
        const sqlUpdatePinsBatchSpy = spyOn(pupilDataService, 'sqlUpdatePinsBatch')
        // sqlUpdatePins fails the first time and then succeed
        sqlUpdatePinsBatchSpy.and.returnValues(Promise.reject(new Error(duplicateKeyError)), Promise.resolve('ok'))
        const storedPupilsWithPins = pupilArray.filter(p => p.id <= 3).map((p, i) => {
          p.pin = i * 1111
          return p
        })
        const unsavedPupilsMock = pupilArray.filter(p => p.id > 3 && p.id <= 6)
        const unsavedPupilIdsMock = unsavedPupilsMock.map(p => p.id)
        spyOn(pupilDataService, 'sqlFindPupilsWithActivePins').and.returnValue(storedPupilsWithPins)
        const submittedIds = pupilArray.map(p => p.id)
        await pinGenerationService.updatePupilPins(submittedIds, 9991999)
        expect(pupilDataService.sqlUpdatePinsBatch).toHaveBeenCalledTimes(2)
        expect(sqlFindByIdsSpy.calls.all()[1].args[0]).toEqual(unsavedPupilIdsMock)
        const updateArgs = sqlUpdatePinsBatchSpy.calls.all()[1].args[0]
        const updateArgsIds = updateArgs.map(p => p.id)
        const updateArgsPins = updateArgs.map(p => p.pin).filter(p => !!p)
        expect(updateArgsIds).toEqual(unsavedPupilIdsMock)
        expect(updateArgsPins.length).toBe(unsavedPupilsMock.length)
        expect(pinGenerationService.pinSubmissionAttempts).toBe(1)
      })
      it('when sqlUpdatePinsBatch throws duplicate key error and throw another error when max attempts are reached', async () => {
        pinGenerationService.pinSubmissionMaxAttempts = 2
        pinGenerationService.pinSubmissionAttempts = 0
        const sqlFindByIdsSpy = spyOn(pupilDataService, 'sqlFindByIds')
        sqlFindByIdsSpy.and.callFake((list) => pupilArray.filter(p => list.includes(p.id)))
        const sqlUpdatePinsBatchSpy = spyOn(pupilDataService, 'sqlUpdatePinsBatch')
        // sqlUpdatePins fails 3 times
        sqlUpdatePinsBatchSpy.and.returnValues(
          Promise.reject(new Error(duplicateKeyError)),
          Promise.reject(new Error(duplicateKeyError)),
          Promise.reject(new Error(duplicateKeyError))
        )
        const storedPupilsWithPins = (max) => pupilArray.filter(p => p.id <= max).map((p, i) => {
          p.pin = i * 1111
          return p
        })
        spyOn(pupilDataService, 'sqlFindPupilsWithActivePins').and.returnValues(
          storedPupilsWithPins(2),
          storedPupilsWithPins(3),
          storedPupilsWithPins(4))
        const submittedIds = pupilArray.map(p => p.id)
        try {
          await pinGenerationService.updatePupilPins(submittedIds, 9991999)
          fail('expected to throw')
        } catch (error) {
          expect(error.message).toEqual(`${pinGenerationService.pinSubmissionMaxAttempts} allowed attempts 
      for pin generation resubmission have been reached`)
          expect(pinGenerationService.pinSubmissionAttempts).toBe(0)
          expect(pupilDataService.sqlUpdatePinsBatch).toHaveBeenCalledTimes(3)
        }
      })
    })
  })

  describe('generateSchoolPassword', () => {
    describe('if schoolPin is not valid', () => {
      it('should generate school password', () => {
        const school = Object.assign({}, schoolMock)
        const result = pinGenerationService.generateSchoolPassword(school)
        expect(result.pinExpiresAt).toBeDefined()
        expect(result.pin.length).toBe(8)
        expect(/^[a-z]{3}[2-9]{2}[a-z]{3}$/.test(result.pin)).toBe(true)
      })
    })

    describe('if the pin expiration date is before same day 4pm', () => {
      beforeEach(() => {
        sandbox.useFakeTimers(moment().startOf('day').subtract(1, 'years').valueOf())
      })
      it('should not generate school password', () => {
        const school = Object.assign({}, schoolMock)
        school.pinExpiresAt = moment().startOf('day').add(16, 'hours')
        const result = pinGenerationService.generateSchoolPassword(school)
        expect(result).toBe(undefined)
      })
    })

    describe('if the pin expiration date is after same day 4pm', () => {
      let school
      beforeEach(() => {
        school = Object.assign({}, schoolMock)
        school.pinExpiresAt = moment().startOf('day').add(16, 'hours')
        sandbox.useFakeTimers(moment().startOf('day').add(100, 'years').valueOf())
      })
      it('it should generate school password ', () => {
        const password = school.pin
        const result = pinGenerationService.generateSchoolPassword(school)
        expect(result.pin === password).toBeFalsy()
      })
    })
  })

  describe('generateCryptoRandomNumber', () => {
    it('should generate a random number in specific range', () => {
      const number = pinGenerationService.generateCryptoRandomNumber(1, 6)
      expect(typeof number).toBe('number')
      expect(number >= 0 || number <= 6).toBeTruthy()
    })
  })
})
