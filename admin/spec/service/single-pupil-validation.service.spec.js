'use strict'
/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const singlePupilValidationCSVService = require('../../services/single-pupil-validation.service')
const PupilValidator = require('../../lib/validator/pupil-validator')

describe('single-pupil-validation.service', () => {
  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('generate with valid arguments', () => {
    beforeEach(() => {
      sandbox.mock(PupilValidator).expects('validate').resolves({ hasError: () => false })
      proxyquire('../../services/generate-error-csv.service', {
        '../../lib/validator/pupil-validator': PupilValidator
      })
    })

    it('returns a pupil with no errors', async (done) => {
      const school = { _id: '001' }
      const data = [ 'John', 'Lawrence', 'Smith', 'X822200014001', '5/22/2005', 'M' ]
      const { single } = await singlePupilValidationCSVService.validate(data, school)
      expect(single).toBeDefined()
      expect(single[6]).toBeUndefined()
      done()
    })
  })
  describe('generate with invalid arguments', () => {
    const validationError = {
      errors: { upn: 'UPN invalid (character 13 not a recognised value)',
        'dob-year': 'Date of birth can\'t be in the future',
        'dob-day': 'Date of birth can\'t be in the future',
        'dob-month': 'Date of birth can\'t be in the future'
      }
    }
    beforeEach(() => {
      sandbox.mock(PupilValidator).expects('validate').resolves({ hasError: () => true, ...validationError })
      proxyquire('../../services/generate-error-csv.service', {
        '../../lib/validator/pupil-validator': PupilValidator
      })
    })

    it('returns a pupil with errors', async (done) => {
      const school = { _id: '001' }
      const data = [ 'John', 'Lawrence', 'Smith', 'X8222000140011', '5/22/2005', 'M' ]
      const { single } = await singlePupilValidationCSVService.validate(data, school)
      expect(single).toBeDefined()
      expect(single[6]).toBeDefined()
      expect(single[6])
        .toBe('UPN invalid (character 13 not a recognised value), Date of birth can\'t be in the future')
      done()
    })
  })
})
