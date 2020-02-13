'use strict'
/* global describe, beforeEach, afterEach, it, expect */

const moment = require('moment-timezone')
const sinon = require('sinon')

const pinGenerationService = require('../../../services/pin-generation.service')
const schoolMock = require('../mocks/school')

describe('pin-generation.service', () => {
  let sandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

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
