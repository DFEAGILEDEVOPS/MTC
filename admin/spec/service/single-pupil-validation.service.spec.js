'use strict'
/* global describe, beforeEach, it, expect, spyOn */

const singlePupilValidationCSVService = require('../../services/single-pupil-validation.service')
const PupilValidator = require('../../lib/validator/pupil-validator')
const ValidationError = require('../../lib/validation-error')

describe('single-pupil-validation.service', () => {
  describe('generate with valid arguments', () => {
    beforeEach(() => {
      // An empty validation error - indicating no errors at all
      spyOn(PupilValidator, 'validate').and.returnValue(Promise.resolve(new ValidationError()))
    })

    it('returns a pupil with no errors', async (done) => {
      const school = { _id: '001' }
      const data = [ 'John', 'Lawrence', 'Smith', 'X822200014001', '5/22/2005', 'M' ]
      singlePupilValidationCSVService.init()
      const { single } = await singlePupilValidationCSVService.validate(data, school)
      expect(single).toBeDefined()
      expect(single[6]).toBeUndefined()
      done()
    })
  })

  describe('generate with invalid arguments', () => {
    const validationError = new ValidationError()
      .addError('upn', 'UPN invalid (character 13 not a recognised value)')
      .addError('dob-year', 'Date of birth can\'t be in the future')
      .addError('dob-day', 'Date of birth can\'t be in the future')
      .addError('dob-month', 'Date of birth can\'t be in the future')

    beforeEach(() => {
      spyOn(PupilValidator, 'validate').and.returnValue(Promise.resolve(validationError))
    })

    it('returns a pupil with errors', async (done) => {
      const school = { _id: '001' }
      const data = [ 'John', 'Lawrence', 'Smith', 'X8222000140011', '5/22/2005', 'M' ]
      singlePupilValidationCSVService.init()
      const { single } = await singlePupilValidationCSVService.validate(data, school)
      expect(single).toBeDefined()
      expect(single[6]).toBeDefined()
      expect(single[6])
        .toBe('UPN invalid (character 13 not a recognised value), Date of birth can\'t be in the future')
      done()
    })
  })
})
