'use strict'
/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const moment = require('moment')
const sinon = require('sinon')
const pupilDataService = require('../../services/data-access/pupil.data.service')
const checkDataService = require('../../services/data-access/check.data.service')
const pinGenerationService = require('../../services/pin-generation.service')
const restartService = require('../../services/restart.service')
const config = require('../../config')

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
        pupil2._id = '595cd5416e5ca13e48ed2520'
        pupil2.pin = ''
        pupil1.foreName = 'foreName'
        pupil1.lastName = 'lastName'
        sandbox.mock(pupilDataService).expects('getSortedPupils').resolves([ pupil1, pupil2 ])
        sandbox.mock(checkDataService).expects('count').resolves(0).twice()
        sandbox.mock(restartService).expects('canRestart').resolves(false).twice()
        proxyquire('../../services/pin-generation.service', {
          '../../services/pupil.service': pupilDataService,
          '../../services/restart.service': restartService,
          '../../services/data-access/check.data.service': checkDataService
        })
      })
      it('with specific properties', async (done) => {
        const pupils = await pinGenerationService.getPupils(schoolMock._id, 'lastName', 'asc')
        expect(pupils.length).toBe(2)
        expect(Object.keys(pupils[ 0 ]).length).toBe(6)
        done()
      })
    })

    describe('filter and returns sorted pupils', () => {
      beforeEach(() => {
        const pupil1 = Object.assign({}, pupilMock)
        pupil1.pin = ''
        const pupil2 = Object.assign({}, pupilMock)
        pupil2._id = '595cd5416e5ca13e48ed2520'
        pupil2.pin = 'f55sg'
        pupil2.pinExpiresAt = moment().startOf('day').add(16, 'hours')
        sandbox.mock(pupilDataService).expects('getSortedPupils').resolves([ pupil1, pupil2 ])
        sandbox.mock(checkDataService).expects('count').resolves(0).twice()
        sandbox.mock(restartService).expects('canRestart').resolves(false).twice()
        sandbox.useFakeTimers(moment().startOf('day'))
        proxyquire('../../services/pin-generation.service', {
          '../../services/pupil.service': pupilDataService,
          '../../services/restart.service': restartService,
          '../../services/data-access/check.data.service': checkDataService
        })
      })
      it('without expired pins', async (done) => {
        const pupils = await pinGenerationService.getPupils(schoolMock._id, 'lastName', 'asc')
        expect(pupils.length).toBe(1)
        done()
      })
    })

    describe('filters pupils who reached the max number of attempts and cant restart', () => {
      beforeEach(() => {
        const pupil1 = Object.assign({}, pupilMock)
        pupil1.pin = ''
        const pupil2 = Object.assign({}, pupilMock)
        pupil2._id = '595cd5416e5ca13e48ed2520'
        pupil2.pin = 'f55sg'
        pupil2.pinExpiresAt = moment().startOf('day').add(16, 'hours')
        sandbox.mock(pupilDataService).expects('getSortedPupils').resolves([ pupil1, pupil2 ])
        sandbox.mock(checkDataService).expects('count').resolves(3).twice()
        sandbox.mock(restartService).expects('canRestart').resolves(false).twice()
        sandbox.useFakeTimers(moment().startOf('day'))
        proxyquire('../../services/pin-generation.service', {
          '../../services/pupil.service': pupilDataService,
          '../../services/restart.service': restartService,
          '../../services/data-access/check.data.service': checkDataService
        })
      })
      it('without expired pins', async (done) => {
        const pupils = await pinGenerationService.getPupils(schoolMock._id, 'lastName', 'asc')
        expect(pupils.length).toBe(0)
        done()
      })
    })

    describe('pupils with same fullname', () => {
      beforeEach(() => {
        const pupil1 = Object.assign({}, pupilMock)
        pupil1.pin = ''
        const pupil2 = Object.assign({}, pupilMock)
        pupil2._id = '595cd5416e5ca13e48ed2520'
        pupil2.pin = ''
        pupil2.foreName = pupil1.foreName
        pupil2.lastName = pupil1.lastName
        sandbox.mock(pupilDataService).expects('getSortedPupils').resolves([ pupil1, pupil2 ])
        sandbox.mock(checkDataService).expects('count').resolves(0).twice()
        sandbox.mock(restartService).expects('canRestart').resolves(false).twice()
        proxyquire('../../services/pin-generation.service', {
          '../../services/pupil.service': pupilDataService,
          '../../services/restart.service': restartService,
          '../../services/data-access/check.data.service': checkDataService
        })
      })
      it('should display DoB', async (done) => {
        const pupils = await pinGenerationService.getPupils(schoolMock._id, 'lastName', 'asc')
        expect(pupils.length).toBe(2)
        expect(pupils[ 0 ].showDoB).toBeTruthy()
        expect(pupils[ 1 ].showDoB).toBeTruthy()
        done()
      })
      it('should display middle names', async (done) => {
        const pupils = await pinGenerationService.getPupils(schoolMock._id, 'lastName', 'asc')
        expect(pupils.length).toBe(2)
        expect(pupils[ 0 ].showMiddleNames).toBeTruthy()
        expect(pupils[ 1 ].showMiddleNames).toBeTruthy()
        done()
      })
    })
  })

  describe('generatePupilPins', () => {
    describe('should generate pin and expire timestamp', () => {
      let pupil1
      let pupil2
      beforeEach(() => {
        pupil1 = Object.assign({}, pupilMock)
        pupil1.pin = ''
        pupil2 = Object.assign({}, pupilMock)
        pupil2._id = '595cd5416e5ca13e48ed2520'
        pupil2.pin = ''
        sandbox.mock(pupilDataService).expects('findOne').twice().resolves(pupil1)
        proxyquire('../../services/pin-generation.service', {
          '../../services/pupil.service': pupilDataService
        })
      })
      it('when pin has not been generated', async (done) => {
        const pupils = await pinGenerationService.generatePupilPins([ pupil1._id, pupil2._id ])
        expect(pupils[ 0 ].pin.length).toBe(5)
        expect(pupils[ 0 ].pinExpiresAt).toBeDefined()
        done()
      })
    })

    describe('does not return generate pin and timestamp', () => {
      let pupil1
      let pupil2
      beforeEach(() => {
        pupil1 = Object.assign({}, pupilMock)
        pupil1.pin = 'fdsgs'
        pupil1.pinExpiresAt = moment().startOf('day').add(16, 'hours')
        pupil2 = Object.assign({}, pupilMock)
        pupil2._id = '595cd5416e5ca13e48ed2520'
        pupil2.pin = 'fdsgs'
        pupil2.pinExpiresAt = moment().startOf('day').add(16, 'hours')
        sandbox.useFakeTimers(moment().startOf('day').subtract(1, 'months').valueOf())
        sandbox.mock(pupilDataService).expects('findOne').twice().resolves(pupil1)
        proxyquire('../../services/pin-generation.service', {
          '../../services/pupil.service': pupilDataService
        })
      })
      it('when existing expiration date is before same day 4pm', async (done) => {
        const pin = pupil1.pin
        const pupils = await pinGenerationService.generatePupilPins([ pupil1._id, pupil2._id ])
        expect(pupils[ 0 ].pin).toBe(pin)
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
        if (config.Data.allowedWords) {
          expect(result.schoolPin.length).toBe(5)
          expect(/[a-z]/i.test(result.schoolPin)).toBe(true)
          expect(/[1-9]/i.test(result.schoolPin)).toBe(true)
        }
      })
    })

    describe('if the pin expiration date is before same day 4pm', () => {
      beforeEach(() => {
        sandbox.useFakeTimers(moment().startOf('day').subtract(1, 'years').valueOf())
      })
      it('should not generate school password', () => {
        const school = Object.assign({}, schoolMock)
        const password = school.schoolPin
        school.pinExpiresAt = moment().startOf('day').add(16, 'hours')
        const result = pinGenerationService.generateSchoolPassword(school)
        expect(result.schoolPin).toBe(password)
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
        const password = school.schoolPin
        const result = pinGenerationService.generateSchoolPassword(school)
        expect(result.schoolPin === password).toBeFalsy()
      })
    })
  })
})
