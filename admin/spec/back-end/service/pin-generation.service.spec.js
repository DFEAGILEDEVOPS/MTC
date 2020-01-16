'use strict'
/* global describe, beforeEach, afterEach, it, expect, spyOn */

const proxyquire = require('proxyquire').noCallThru()
const moment = require('moment')
const sinon = require('sinon')

const checkDataService = require('../../../services/data-access/check.data.service')
const pinGenerationService = require('../../../services/pin-generation.service')
const pupilAttendanceService = require('../../../services/attendance.service')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const restartService = require('../../../services/restart.service')

const pupilMock = require('../mocks/pupil')
const schoolMock = require('../mocks/school')

describe('pin-generation.service', () => {
  let sandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
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
        sandbox.mock(pupilDataService).expects('sqlFindPupilsBySchoolId').resolves([pupil1, pupil2])
        sandbox.mock(checkDataService).expects('sqlFindNumberOfChecksStartedByPupil').resolves(0).twice()
        sandbox.mock(restartService).expects('canRestart').resolves(false).twice()
        sandbox.mock(pupilAttendanceService).expects('hasAttendance').resolves(false).twice()
        proxyquire('../../../services/pin-generation.service', {
          '../../../services/pupil.service': pupilDataService,
          '../../../services/restart.service': restartService,
          '../../../services/data-access/check.data.service': checkDataService
        })
      })
      it('with specific properties', async (done) => {
        const pupils = await pinGenerationService.getPupils(schoolMock.dfeNumber)
        expect(pupils.length).toBe(2)
        expect(Object.keys(pupils[0]).length).toBe(8)
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
        sandbox.mock(pupilDataService).expects('sqlFindPupilsBySchoolId').resolves([pupil1, pupil2])
        sandbox.mock(checkDataService).expects('sqlFindNumberOfChecksStartedByPupil').resolves(0).twice()
        sandbox.mock(restartService).expects('canRestart').resolves(false).twice()
        sandbox.mock(pupilAttendanceService).expects('hasAttendance').resolves(false).twice()
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
        sandbox.mock(pupilDataService).expects('sqlFindPupilsBySchoolId').resolves([pupil1, pupil2])
        sandbox.mock(checkDataService).expects('sqlFindNumberOfChecksStartedByPupil').resolves(3).twice()
        sandbox.mock(restartService).expects('canRestart').resolves(false).twice()
        sandbox.mock(pupilAttendanceService).expects('hasAttendance').resolves(false).twice()
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
        sandbox.mock(pupilDataService).expects('sqlFindPupilsBySchoolId').resolves([pupil1, pupil2])
        sandbox.mock(checkDataService).expects('sqlFindNumberOfChecksStartedByPupil').resolves(0).twice()
        sandbox.mock(restartService).expects('canRestart').resolves(false).twice()
        sandbox.mock(pupilAttendanceService).expects('hasAttendance').resolves(false).twice()
        proxyquire('../../../services/pin-generation.service', {
          '../../../services/pupil.service': pupilDataService,
          '../../../services/restart.service': restartService,
          '../../../services/data-access/check.data.service': checkDataService
        })
      })
      it('should display DoB', async (done) => {
        const pupils = await pinGenerationService.getPupils(schoolMock.dfeNumber)
        expect(pupils.length).toBe(2)
        expect(pupils[0].showDoB).toBeTruthy()
        expect(pupils[1].showDoB).toBeTruthy()
        done()
      })
      it('should display middle names', async (done) => {
        const pupils = await pinGenerationService.getPupils(schoolMock.dfeNumber)
        expect(pupils.length).toBe(2)
        expect(pupils[0].middleNames).toBeTruthy()
        expect(pupils[0].fullName).toBe('One, Pupil Middle')
        done()
      })
    })
    describe('does not return pupils', () => {
      it('who are flagged as not taking the check', async (done) => {
        const pupil1 = Object.assign({}, pupilMock)
        pupil1.pin = ''
        spyOn(pupilDataService, 'sqlFindPupilsBySchoolId').and.returnValue([pupil1])
        spyOn(checkDataService, 'sqlFindNumberOfChecksStartedByPupil').and.returnValue(0)
        spyOn(restartService, 'canRestart').and.returnValue(false)
        spyOn(pupilAttendanceService, 'hasAttendance').and.returnValue(true)
        const pupils = await pinGenerationService.getPupils(schoolMock.dfeNumber)
        expect(pupils.length).toBe(0)
        done()
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
