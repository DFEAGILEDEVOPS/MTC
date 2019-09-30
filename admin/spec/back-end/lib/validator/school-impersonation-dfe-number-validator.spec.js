'use strict'

/* global describe, it expect */
const schoolImpersonationDfeNumberValidator = require('../../../../lib/validator/school-impersonation-dfe-number-validator')

describe('schoolImpersonationDfeNumberValidator', function () {
  describe('isDfeNumberEmpty', function () {
    it('should not add a validation error if dfeNumber is not empty', function () {
      const dfeNumber = '1230000'
      const result = schoolImpersonationDfeNumberValidator.isDfeNumberEmpty(dfeNumber)
      expect(result.hasError()).toBeFalsy()
    })
    it('should add a validation error if dfeNumber is empty', function () {
      const dfeNumber = undefined
      const result = schoolImpersonationDfeNumberValidator.isDfeNumberEmpty(dfeNumber)
      expect(result.hasError()).toBeTruthy()
    })
  })
  describe('schoolImpersonationDfeNumberValidator', function () {
    it('should not add a validation error if school object is valid', function () {
      const school = { id: 1 }
      const result = schoolImpersonationDfeNumberValidator.isDfeNumberValid(school)
      expect(result.hasError()).toBeFalsy()
    })
    it('should add a validation error if school object is not valid', function () {
      const school = undefined
      const result = schoolImpersonationDfeNumberValidator.isDfeNumberValid(school)
      expect(result.hasError()).toBeTruthy()
    })
  })
})
