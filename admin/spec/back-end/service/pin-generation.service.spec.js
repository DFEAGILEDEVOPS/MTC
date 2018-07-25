'use strict'
/* global describe, beforeEach, afterEach, it, expect, spyOn, fail */

const proxyquire = require('proxyquire').noCallThru()
const moment = require('moment')
const sinon = require('sinon')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const checkDataService = require('../../../services/data-access/check.data.service')
const pupilAttendanceDataService = require('../../../services/data-access/pupil-attendance.data.service')
const pinGenerationService = require('../../../services/pin-generation.service')
const restartService = require('../../../services/restart.service')

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
        proxyquire('../../../services/pin-generation.service', {
          '../../../services/pupil.service': pupilDataService,
          '../../../services/restart.service': restartService,
          '../../../services/data-access/check.data.service': checkDataService
        })
      })
      it('with specific properties', async (done) => {
        const pupils = await pinGenerationService.getPupils(schoolMock.dfeNumber)
        expect(pupils.length).toBe(2)
        expect(Object.keys(pupils[ 0 ]).length).toBe(8)
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
        proxyquire('../../../services/pin-generation.service', {
          '../../../services/pupil.service': pupilDataService,
          '../../../services/restart.service': restartService,
          '../../../services/data-access/check.data.service': checkDataService
        })
      })
      it('without expired pins', async (done) => {
        const pupils = await pinGenerationService.getPupils(schoolMock.dfeNumber)
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
        proxyquire('../../../services/pin-generation.service', {
          '../../../services/pupil.service': pupilDataService,
          '../../../services/restart.service': restartService,
          '../../../services/data-access/check.data.service': checkDataService
        })
      })
      it('without expired pins', async (done) => {
        const pupils = await pinGenerationService.getPupils(schoolMock.dfeNumber)
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
        proxyquire('../../../services/pin-generation.service', {
          '../../../services/pupil.service': pupilDataService,
          '../../../services/restart.service': restartService,
          '../../../services/data-access/check.data.service': checkDataService
        })
      })
      it('should display DoB', async (done) => {
        const pupils = await pinGenerationService.getPupils(schoolMock.dfeNumber)
        expect(pupils.length).toBe(2)
        expect(pupils[ 0 ].showDoB).toBeTruthy()
        expect(pupils[ 1 ].showDoB).toBeTruthy()
        done()
      })
      it('should display middle names', async (done) => {
        const pupils = await pinGenerationService.getPupils(schoolMock.dfeNumber)
        expect(pupils.length).toBe(2)
        expect(pupils[ 0 ].middleNames).toBeTruthy()
        expect(pupils[ 0 ].fullName).toBe('One, Pupil Middle')
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
        const pupils = await pinGenerationService.getPupils(schoolMock.dfeNumber)
        expect(pupils.length).toBe(0)
        done()
      })
    })
  })

  describe('updatePupilPins', () => {
    const schoolId = 42
    let pupilArray, submittedIds, storedPupilsWithPins, duplicateKeyError
    beforeEach(() => {
      pupilArray = []
      for (let i = 0; i <= 20; i++) {
        const pupil = Object.assign({}, pupilMock)
        pupil.id = i + 1
        pupil.pin = undefined
        pupil.pinExpiresAt = undefined
        pupilArray.push(pupil)
      }
      storedPupilsWithPins = (min, max) => pupilArray.filter(p => p.id >= min && p.id <= max).map((p, i) => {
        p.pin = i * 1111
        return p
      })
      submittedIds = pupilArray.map(p => p.id)

      duplicateKeyError = {
        message: `Cannot insert duplicate key row in object 'mtc_admin.pupil' 
        with unique index 'pupil_school_id_pin_uindex'.`,
        code: 'EREQUEST',
        number: 2601,
        state: 1,
        class: 14,
        serverName: '2bc0b49d251c',
        procName: '',
        lineNumber: 4
      }
    })
    it('should throw an error when received data structure is not an array', async () => {
      try {
        await pinGenerationService.updatePupilPins(new Set(pupilArray), 9991999, 100, 100, schoolId)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Received list of pupils is not an array')
      }
    })

    it('throws an error when schoolId is not provided', async () => {
      try {
        await pinGenerationService.updatePupilPins(pupilArray, 9991999, 100, 100, undefined)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Parameter `schoolId` not provided')
      }
    })

    describe('for live pins', () => {
      it('should generate pin and execute update when pins have not been generated', async () => {
        spyOn(pupilDataService, 'sqlUpdatePinsBatch')
        spyOn(pupilDataService, 'sqlFindByIds').and.callFake((list) => pupilArray.filter(p => list.includes(p.id)))
        await pinGenerationService.updatePupilPins(submittedIds, 9991999, 100, 100, schoolId, 'live')
        const data = pupilArray.map(p => ({ id: p.id, pin: p.pin, pinExpiresAt: p.pinExpiresAt }))
        expect(pupilDataService.sqlUpdatePinsBatch).toHaveBeenCalledWith(data, 'live')
        expect(pupilDataService.sqlUpdatePinsBatch).toHaveBeenCalledTimes(1)
      })
    })

    describe('for familiarisation pins', () => {
      it('should generate pin and execute update when pins have not been generated', async () => {
        spyOn(pupilDataService, 'sqlUpdatePinsBatch')
        spyOn(pupilDataService, 'sqlFindByIds').and.callFake((list) => pupilArray.filter(p => list.includes(p.id)))
        await pinGenerationService.updatePupilPins(submittedIds, 9991999, 100, 100, schoolId, 'familiarisation')
        const data = pupilArray.map(p => ({ id: p.id, pin: p.pin, pinExpiresAt: p.pinExpiresAt }))
        expect(pupilDataService.sqlUpdatePinsBatch).toHaveBeenCalledWith(data, 'familiarisation')
        expect(pupilDataService.sqlUpdatePinsBatch).toHaveBeenCalledTimes(1)
      })
    })

    describe('retry generating existing pins process', () => {
      let sqlFindByIdsSpy, sqlUpdatePinsBatchSpy
      beforeEach(() => {
        sqlFindByIdsSpy = spyOn(pupilDataService, 'sqlFindByIds')
        sqlFindByIdsSpy.and.callFake((list) => pupilArray.filter(p => list.includes(p.id)))
        sqlUpdatePinsBatchSpy = spyOn(pupilDataService, 'sqlUpdatePinsBatch')
      })
      it('should not occur when the error is not related to pin duplication', async () => {
        const error = { number: 1, message: 'test' }
        sqlUpdatePinsBatchSpy.and.returnValue(Promise.reject(error))
        try {
          await pinGenerationService.updatePupilPins(submittedIds, 9991999, 100, 100, schoolId)
          fail('expected to throw')
        } catch (error) {
          expect(sqlUpdatePinsBatchSpy).toHaveBeenCalledTimes(1)
        }
      })
      it('should occur when sqlUpdatePinsBatch throws duplicate key error and max attempts are not reached', async () => {
        // sqlUpdatePins fails the first time, second time and then succeeds
        sqlUpdatePinsBatchSpy.and.returnValues(
          Promise.reject(duplicateKeyError),
          Promise.reject(duplicateKeyError),
          Promise.resolve('ok')
        )
        const unsavedPupilsMock = (max) => pupilArray.filter(p => p.id < max)
        const unsavedPupilIdsMock = (max) => unsavedPupilsMock(max).map(p => p.id)
        spyOn(pupilDataService, 'sqlFindPupilsWithActivePins').and.returnValues(
          storedPupilsWithPins(6, pupilArray.length),
          storedPupilsWithPins(5, pupilArray.length)
        )
        try {
          await pinGenerationService.updatePupilPins(submittedIds, 9991999, 100, 100, schoolId)
        } catch (error) {
          return fail('not expected to throw: ' + error.message)
        }
        expect(pupilDataService.sqlUpdatePinsBatch).toHaveBeenCalledTimes(3)
        expect(sqlFindByIdsSpy.calls.all()[ 1 ].args[ 0 ]).toEqual(unsavedPupilIdsMock(6))
        expect(sqlFindByIdsSpy.calls.all()[ 2 ].args[ 0 ]).toEqual(unsavedPupilIdsMock(5))
        const updateArgs = (i) => sqlUpdatePinsBatchSpy.calls.all()[ i ].args[ 0 ]
        const updateArgsIds = (i) => updateArgs(i).map(p => p.id)
        const updateArgsPins = (i) => updateArgs(i).map(p => p.pin).filter(p => !!p)
        expect(updateArgsIds(1)).toEqual(unsavedPupilIdsMock(6))
        expect(updateArgsPins(1).length).toBe(unsavedPupilsMock(6).length)
        expect(updateArgsIds(2)).toEqual(unsavedPupilIdsMock(5))
        expect(updateArgsPins(2).length).toBe(unsavedPupilsMock(5).length)
      })
      it('should occur when sqlUpdatePinsBatch throws duplicate key error and throw another error when max attempts are reached', async () => {
        const sqlUpdatePinsBatchReturnValues = Array(101).fill(Promise.reject(duplicateKeyError))
        sqlUpdatePinsBatchSpy.and.returnValues(...sqlUpdatePinsBatchReturnValues)
        const sqlFindPupilsWithActivePinsValues = Array(100).fill(storedPupilsWithPins(4))
        spyOn(pupilDataService, 'sqlFindPupilsWithActivePins').and.returnValues(...sqlFindPupilsWithActivePinsValues)
        try {
          await pinGenerationService.updatePupilPins(submittedIds, 9991999, 100, 100, schoolId)
          fail('expected to throw')
        } catch (error) {
          expect(error.message).toEqual(`100 allowed attempts 
      for pin generation resubmission have been reached`)
          expect(pupilDataService.sqlUpdatePinsBatch).toHaveBeenCalledTimes(101)
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
