'use strict'
/* global describe, beforeEach, it, expect, spyOn */

const singlePupilValidationCSVService = require('../../services/single-pupil-validation.service')
const PupilValidator = require('../../lib/validator/pupil-validator')
const ValidationError = require('../../lib/validation-error')
const schoolMock = require('../mocks/school')

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

    it('detects duplicate upns in the upload file', async () => {
      const pupilCsvData = [
        ['surname', 'firstname', 'middlename', '21/11/2000', 'm', 'Y308212001120'],
        ['surname2', 'firstname2', 'middlename2', '22/11/2001', 'm', 'Y308212001120'] // dup upn!
      ]
      singlePupilValidationCSVService.init()
      // 1st line
      await singlePupilValidationCSVService.validate(pupilCsvData[0], schoolMock)
      // 2 line - with the duplicate
      const {single} = await singlePupilValidationCSVService.validate(pupilCsvData[0], schoolMock)
      expect(single[6]).toBe('UPN is a duplicate of a pupil already in your register')
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
