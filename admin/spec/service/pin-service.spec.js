const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const moment = require('moment')
const pupilDataService = require('../../services/data-access/pupil.data.service')
const schoolDataService = require('../../services/data-access/school.data.service')
const pinService = require('../../services/pin.service')
const pupilMock = require('../mocks/pupil')
const schoolMock = require('../mocks/school')

/* global describe, it, expect, beforeEach, afterEach */

describe('pin.service', () => {
  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())
  describe('getPupilsWithActivePins', () => {
    let sandbox
    let pupil1
    let pupil2
    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      pupil1 = Object.assign({}, pupilMock)
      pupil1.pin = 'f55sg'
      pupil1.pinExpiresAt = moment().startOf('day').add(16, 'hours')
      pupil2 = Object.assign({}, pupilMock)
      pupil2._id = '595cd5416e5ca13e48ed2520'
      pupil2.pinExpiresAt = moment().startOf('day').add(16, 'hours')
    })
    afterEach(() => sandbox.restore())
    describe('if pins are valid', () => {
      beforeEach(() => {
        sandbox.useFakeTimers(moment().startOf('day').subtract(1, 'years').valueOf())
        sandbox.mock(pupilDataService).expects('getSortedPupils').resolves([ pupil1, pupil2 ])
        proxyquire('../../services/pupil.service', {
          '../../services/data-access/pupil.data.service': pupilDataService
        })
      })
      it('it should return a list of active pupils', async () => {
        const pupils = await pinService.getPupilsWithActivePins(schoolMock._id)
        expect(pupils.length).toBe(2)
      })
    })
    describe('if pins are invalid', () => {
      beforeEach(() => {
        sandbox.useFakeTimers(moment().startOf('day').add(100, 'years').valueOf())
        sandbox.mock(pupilDataService).expects('getSortedPupils').resolves([ pupil1, pupil2 ])
        proxyquire('../../services/pupil.service', {
          '../../services/data-access/pupil.data.service': pupilDataService
        })
      })
      it('it should return a list of active pupils', async () => {
        const pupils = await pinService.getPupilsWithActivePins(schoolMock._id)
        expect(pupils.length).toBe(0)
      })
    })
  })
  describe('getActiveSchool', () => {
    beforeEach(() => {
      let school = Object.assign({}, schoolMock)
      school.pinExpiresAt = moment().startOf('day').add(16, 'hours')
      sandbox.mock(schoolDataService).expects('findOne').resolves(school)
      proxyquire('../../services/pin-generation.service', {
        '../../services/data-access/school.data.service': schoolDataService
      })
      describe('if pin is valid', () => {
        beforeEach(() => {
          sandbox.useFakeTimers(moment().startOf('day').subtract(1, 'years').valueOf())
        })
        it('it should return school object', () => {
          const result = pinService.getActiveSchool(school.id)
          expect(result.pinExpiresAt).toBeDefined()
          expect(result.schoolPin).toBeDefined()
        })
      })
      describe('if pin is invalid', () => {
        beforeEach(() => {
          sandbox.useFakeTimers(moment().startOf('day').add(100, 'years').valueOf())
        })
        it('it should return null', () => {
          const result = pinService.getActiveSchool(school.id)
          expect(result).toBeUndefined()
        })
      })
    })
  })
})
