'use strict'
/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
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
        sandbox.mock(pupilDataService).expects('getSortedPupils').resolves([ pupil1, pupil2 ])
        proxyquire('../../services/generate-pins.service', {
          '../../services/pupil.service': pupilDataService
        })
      })
      it('without pre existing pins', async (done) => {
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
    describe('returns pupils with pins', () => {
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
      it('should have pin set and expiry set to false', async (done) => {
        const pupils = await generatePinsService.generatePupilPins(schoolMock._id, 'lastName', 'asc')
        expect(pupils[0].pin.length).toBe(5)
        expect(pupils[0].expired).toBeFalsy()
        done()
      })
    })
  })
})
