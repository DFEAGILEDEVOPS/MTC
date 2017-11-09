'use strict'
const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const moment = require('moment')
const pupilDataService = require('../../services/data-access/pupil.data.service')
const pupilService = require('../../services/pupil.service')
const generatePinsService = require('../../services/generate-pins.service')
const pupilMock = require('../mocks/pupil')
const schoolMock = require('../mocks/school')

/* global describe, it, expect, beforeEach, afterEach */

describe('pupil service', () => {
  describe('calculateScore', () => {
    it('returns undefined if results undefined', () => {
      const actual = pupilService.calculateScorePercentage(undefined)
      expect(actual).toBe(undefined)
    })

    it('returns error message if results do not contain marks', () => {
      const actual = pupilService.calculateScorePercentage({maxMarks: 10})
      expect(actual).toBe('Error Calculating Score')
    })

    it('returns error message if results do not contain maxMarks', () => {
      const actual = pupilService.calculateScorePercentage({marks: 5})
      expect(actual).toBe('Error Calculating Score')
    })

    it('returns error message if score out of range', () => {
      const results = {
        marks: 20,
        maxMarks: 10
      }
      const actual = pupilService.calculateScorePercentage(results)
      expect(actual).toBe('Error Calculating Score')
    })

    it('returns 100% when all answers are correct', () => {
      const results = {
        marks: 10,
        maxMarks: 10
      }
      const actual = pupilService.calculateScorePercentage(results)
      expect(actual).toBe(100)
    })

    it('returns 50% when half the answers are correct', () => {
      const results = {
        marks: 5,
        maxMarks: 10
      }
      const actual = pupilService.calculateScorePercentage(results)
      expect(actual).toBe(50)
    })

    it('returns 0% when no answers are correct', () => {
      const results = {
        marks: 0,
        maxMarks: 10
      }
      const actual = pupilService.calculateScorePercentage(results)
      expect(actual).toBe(0)
    })

    it('rounds to the nearest 1 decimal point when necessary', () => {
      const results = {
        marks: 7,
        maxMarks: 30
      }
      const actual = pupilService.calculateScorePercentage(results)
      expect(actual).toBe(23.3)
    })
  })
  describe('addIdentificationFlags', () => {
    it('returns showDoB property as true for pupils with same fullname', () => {
      const pupil1 = Object.assign({}, pupilMock)
      const pupil2 = Object.assign({}, pupilMock)
      const pupils = pupilService.addIdentificationFlags([pupil1, pupil2])
      expect(pupils[0].showDoB && pupils[1].showDoB).toBeTruthy()
    })
    it('returns showDoB property as false for pupils with different fullname', () => {
      const pupil1 = Object.assign({}, pupilMock)
      const pupil2 = Object.assign({}, pupilMock)
      pupil1.foreName = 'test'
      const pupils = pupilService.addIdentificationFlags([pupil1, pupil2])
      expect(pupils[0].showDoB && pupils[1].showDoB).toBeFalsy()
    })
    it('returns showMiddleNames property as true for pupils with same fullname and DoB', () => {
      const pupil1 = Object.assign({}, pupilMock)
      const pupil2 = Object.assign({}, pupilMock)
      const pupils = pupilService.addIdentificationFlags([pupil1, pupil2])
      expect(pupils[0].showDoB && pupils[1].showMiddleNames).toBeTruthy()
    })
    it('returns showMiddleNames property as false for pupils with different fullname and Dob', () => {
      const pupil1 = Object.assign({}, pupilMock)
      const pupil2 = Object.assign({}, pupilMock)
      pupil1.foreName = 'test'
      const pupils = pupilService.addIdentificationFlags([pupil1, pupil2])
      expect(pupils[0].showDoB && pupils[1].showMiddleNames).toBeFalsy()
    })
  })
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
        sandbox.mock(generatePinsService).expects('isValidPin').resolves(true)
        proxyquire('../../services/pupil.service', {
          '../../services/data-access/pupil.data.service': pupilDataService,
          '../../services/generate-pins.service': generatePinsService
        })
      })
      it('it should return a list of active pupils', async () => {
        const pupils = await pupilService.getPupilsWithActivePins(schoolMock._id)
        expect(pupils.length).toBe(2)
      })
    })
    describe('if pins are invalid', () => {
      beforeEach(() => {
        sandbox.useFakeTimers(moment().startOf('day').add(100, 'years').valueOf())
        sandbox.mock(pupilDataService).expects('getSortedPupils').resolves([ pupil1, pupil2 ])
        sandbox.mock(generatePinsService).expects('isValidPin').resolves(false)
        proxyquire('../../services/pupil.service', {
          '../../services/data-access/pupil.data.service': pupilDataService,
          '../../services/generate-pins.service': generatePinsService
        })
      })
      it('it should return a list of active pupils', async () => {
        const pupils = await pupilService.getPupilsWithActivePins(schoolMock._id)
        expect(pupils.length).toBe(0)
      })
    })
  })
})
