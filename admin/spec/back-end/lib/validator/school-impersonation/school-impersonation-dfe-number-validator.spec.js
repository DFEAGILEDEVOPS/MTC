'use strict'

/* global describe, it expect */
const schoolImpersonationDfeNumberValidator = require('../../../../../lib/validator/school-impersonation/school-impersonation-dfe-number-validator')

describe('schoolImpersonationDfeNumberValidator', function () {
  it('should not add a validation error if school object is valid', function () {
    const school = { id: 1 }
    const result = schoolImpersonationDfeNumberValidator.validate(school)
    expect(result.hasError()).toBeFalsy()
  })
  it('should add a validation error if school object is not valid', function () {
    const school = undefined
    const result = schoolImpersonationDfeNumberValidator.validate(school)
    expect(result.hasError()).toBeTruthy()
  })
})
