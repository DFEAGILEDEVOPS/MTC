'use strict'

/* global describe, it, spyOn expect beforeEach afterEach */

const uuid = require('uuid/v4')
const ValidationError = require('../../../../../lib/validation-error')
let sut

const valueName = 'theUUID'

describe('UUID validator', () => {
  beforeEach(() => {
    sut = require('../../../../../lib/validator/common/uuid-validator')
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  it('should fail when value is empty string', () => {
    const actual = sut.validate('', valueName)
    expect(actual.hasError()).toBe(true)
    const error = actual.get(valueName)
    expect(error).toBe(`${valueName} is required`)
  })

  it('should fail when value is not a uuid', () => {
    const actual = sut.validate('not a uuid', valueName)
    expect(actual.hasError()).toBe(true)
    const error = actual.get(valueName)
    expect(error).toBe(`${valueName} is not a valid UUID`)
  })

  it('should fail when value is a uuid of incorrect length', () => {
    const oneCharShortUuid = '6a2f41a3-c54c-fce8-32d2-0324e1c32e2'
    const actual = sut.validate(oneCharShortUuid, valueName)
    expect(actual.hasError()).toBe(true)
    const error = actual.get(valueName)
    expect(error).toBe(`${valueName} is not a valid UUID`)
  })

  it('should pass when value is a valid uuid', () => {
    const oneCharShortUuid = '6a2f41a3-c54c-fce8-32d2-0324e1c32e21'
    const actual = sut.validate(oneCharShortUuid, valueName)
    expect(actual.hasError()).toBe(false)
  })
})
