'use strict'

/* global describe, it expect */
const schoolImpersonationValidator = require('../../../../lib/validator/school-impersonation-validator')

describe('schoolImpersonationDfeNumberValidator', function () {
  describe('isDfeNumberEmpty', function () {
    it('should not add a validation error if dfeNumber is a string value', function () {
      const dfeNumber = '1230000'
      const result = schoolImpersonationValidator.isDfeNumberValid(dfeNumber)
      expect(result.hasError()).toBeFalsy()
    })
    it('should add a validation error if dfeNumber is a numeric value', function () {
      const dfeNumber = 1230000
      const result = schoolImpersonationValidator.isDfeNumberValid(dfeNumber)
      expect(result.hasError()).toBeTruthy()
    })
    it('should add a validation error if dfeNumber is empty', function () {
      const dfeNumber = undefined
      const result = schoolImpersonationValidator.isDfeNumberValid(dfeNumber)
      expect(result.hasError()).toBeTruthy()
    })
    it('should not add a validation error if dfeNumber is a string that contains only a number', function () {
      const dfeNumber = '1230000'
      const result = schoolImpersonationValidator.isDfeNumberValid(dfeNumber)
      expect(result.hasError()).toBeFalsy()
    })
    it('should add a validation error if dfeNumber is a string that contains two numbers and a space in-between', function () {
      const dfeNumber = '123 0000'
      const result = schoolImpersonationValidator.isDfeNumberValid(dfeNumber)
      expect(result.hasError()).toBeTruthy()
    })
    it('should add a validation error if dfeNumber is a string that contains one number and one character and a space in-between', function () {
      const dfeNumber = '1 d'
      const result = schoolImpersonationValidator.isDfeNumberValid(dfeNumber)
      expect(result.hasError()).toBeTruthy()
    })
    it('should add a validation error if dfeNumber is a string that contains a number and one special character', function () {
      const dfeNumber = '1*'
      const result = schoolImpersonationValidator.isDfeNumberValid(dfeNumber)
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
