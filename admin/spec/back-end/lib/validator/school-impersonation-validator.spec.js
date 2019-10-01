'use strict'

/* global describe, it expect */
const schoolImpersonationValidator = require('../../../../lib/validator/school-impersonation-validator')

describe('schoolImpersonationDfeNumberValidator', function () {
  describe('isDfeNumberEmpty', function () {
    it('should not add a validation error if dfeNumber is a string value', function () {
      const dfeNumber = '1230000'
      const result = schoolImpersonationValidator.isDfeNumberEmpty(dfeNumber)
      expect(result.hasError()).toBeFalsy()
    })
    it('should not add a validation error if dfeNumber is a numeric value', function () {
      const dfeNumber = 1230000
      const result = schoolImpersonationValidator.isDfeNumberEmpty(dfeNumber)
      expect(result.hasError()).toBeFalsy()
    })
    it('should add a validation error if dfeNumber is empty', function () {
      const dfeNumber = undefined
      const result = schoolImpersonationValidator.isDfeNumberEmpty(dfeNumber)
      expect(result.hasError()).toBeTruthy()
    })
  })
  describe('isSchoolRecordValid', function () {
    it('should not add a validation error if school object is valid', function () {
      const school = { id: 1 }
      const result = schoolImpersonationValidator.isSchoolRecordValid(school)
      expect(result.hasError()).toBeFalsy()
    })
    it('should add a validation error if school object is not valid', function () {
      const school = undefined
      const result = schoolImpersonationValidator.isSchoolRecordValid(school)
      expect(result.hasError()).toBeTruthy()
    })
  })
})
