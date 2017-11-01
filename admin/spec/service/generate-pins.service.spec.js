'use strict'
/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const moment = require('moment')
const sinon = require('sinon')
const pupilDataService = require('../../services/data-access/pupil.data.service')
const generatePinsService = require('../../services/generate-pins.service')

const pupilMock = require('../mocks/pupil')
const schoolMock = require('../mocks/school')

describe('generate-pins.service', () => {
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
        proxyquire('../../services/generate-pins.service', {
          '../../services/pupil.service': pupilDataService
        })
      })
      it('with specific properties', async (done) => {
        const pupils = await generatePinsService.getPupils(schoolMock._id, 'lastName', 'asc')
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
        sandbox.useFakeTimers(moment().startOf('day'))
        proxyquire('../../services/generate-pins.service', {
          '../../services/pupil.service': pupilDataService
        })
      })
      it('without expired pins', async (done) => {
        const pupils = await generatePinsService.getPupils(schoolMock._id, 'lastName', 'asc')
        expect(pupils.length).toBe(1)
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
        proxyquire('../../services/generate-pins.service', {
          '../../services/pupil.service': pupilDataService
        })
      })
      it('should display DoB as well', async (done) => {
        const pupils = await generatePinsService.getPupils(schoolMock._id, 'lastName', 'asc')
        expect(pupils.length).toBe(2)
        expect(pupils[0].showDoB).toBeTruthy()
        expect(pupils[1].showDoB).toBeTruthy()
        done()
      })
    })
  })

  describe('generatePupilPins', () => {
    describe('should generate pin and expire timestamp', () => {
      beforeEach(() => {
        const pupil1 = Object.assign({}, pupilMock)
        pupil1.pin = ''
        const pupil2 = Object.assign({}, pupilMock)
        pupil2._id = '595cd5416e5ca13e48ed2520'
        pupil2.pin = ''
        sandbox.mock(pupilDataService).expects('find').resolves([ pupil1, pupil2 ])
        proxyquire('../../services/generate-pins.service', {
          '../../services/pupil.service': pupilDataService
        })
      })
      it('when pin in empty', async (done) => {
        const pupils = await generatePinsService.generatePupilPins(schoolMock._id, 'lastName', 'asc')
        expect(pupils[0].pin.length).toBe(5)
        expect(pupils[0].pinExpiresAt).toBeDefined()
        done()
      })
    })

    describe('does not return generate pin and timestamp', () => {
      let pupil1
      beforeEach(() => {
        pupil1 = Object.assign({}, pupilMock)
        pupil1.pin = 'fdsgs'
        pupil1.pinExpiresAt = moment().startOf('day').add(16, 'hours')
        const pupil2 = Object.assign({}, pupilMock)
        pupil2._id = '595cd5416e5ca13e48ed2520'
        pupil2.pin = 'fdsgs'
        pupil2.pinExpiresAt = moment().startOf('day').add(16, 'hours')
        sandbox.useFakeTimers(moment().startOf('day').subtract(1, 'months').valueOf())
        sandbox.mock(pupilDataService).expects('find').resolves([ pupil1, pupil2 ])
        proxyquire('../../services/generate-pins.service', {
          '../../services/pupil.service': pupilDataService
        })
      })
      it('when existing expiration date is before same day 4pm', async (done) => {
        const pin = pupil1.pin
        const pupils = await generatePinsService.generatePupilPins(schoolMock._id, 'lastName', 'asc')
        expect(pupils[0].pin).toBe(pin)
        done()
      })
    })
  })

  describe('generateSchoolPassword', () => {
    it('should generate school password if schoolPin is not valid', () => {
      const school = Object.assign({}, schoolMock)
      const result = generatePinsService.generateSchoolPassword(school)
      expect(result.pinExpiresAt).toBeDefined()
      expect(result.schoolPin.length).toBe(8)
    })

    describe('if the pin expiration date is before same day 4pm', () => {
      beforeEach(() => {
        sandbox.useFakeTimers(moment().startOf('day').subtract(1, 'years').valueOf())
      })
      it('should not generate school password', () => {
        const school = Object.assign({}, schoolMock)
        const password = school.schoolPin
        school.pinExpiresAt = moment().startOf('day').add(16, 'hours')
        const result = generatePinsService.generateSchoolPassword(school)
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
        const result = generatePinsService.generateSchoolPassword(school)
        expect(result.schoolPin === password).toBeFalsy()
      })
    })
  })
})
