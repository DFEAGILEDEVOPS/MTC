'use strict'

/* global describe, it expect */
const schoolImpersonationEmptyValueValidator = require('../../../../../lib/validator/school-impersonation/school-impersonation-empty-value-validator')

describe('schoolImpersonationEmptyValueValidator', function () {
  it('should not add a validation error if dfeNumber is not empty', function () {
    const dfeNumber = '1230000'
    const result = schoolImpersonationEmptyValueValidator.validate(dfeNumber)
    expect(result.hasError()).toBeFalsy()
  })
  it('should add a validation error if dfeNumber is empty', function () {
    const dfeNumber = undefined
    const result = schoolImpersonationEmptyValueValidator.validate(dfeNumber)
    expect(result.hasError()).toBeTruthy()
  })
})
