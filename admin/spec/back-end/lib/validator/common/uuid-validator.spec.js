'use strict'

let sut

const valueName = 'theUUID'

describe('UUID validator', () => {
  beforeEach(() => {
    sut = require('../../../../../lib/validator/common/uuid-validator')
  })

  test('should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('should fail when value is empty string', () => {
    const actual = sut.validate('', valueName)
    expect(actual.hasError()).toBe(true)
    const error = actual.get(valueName)
    expect(error).toBe(`${valueName} is required`)
  })

  test('should fail when value is not a uuid', () => {
    const actual = sut.validate('not a uuid', valueName)
    expect(actual.hasError()).toBe(true)
    const error = actual.get(valueName)
    expect(error).toBe(`${valueName} is not a valid UUID`)
  })

  test('should fail when value is a uuid of incorrect length', () => {
    const oneCharShortUuid = '6a2f41a3-c54c-fce8-32d2-0324e1c32e2'
    const actual = sut.validate(oneCharShortUuid, valueName)
    expect(actual.hasError()).toBe(true)
    const error = actual.get(valueName)
    expect(error).toBe(`${valueName} is not a valid UUID`)
  })

  test('should pass when value is a valid uuid', () => {
    const oneCharShortUuid = '6a2f41a3-c54c-fce8-32d2-0324e1c32e21'
    const actual = sut.validate(oneCharShortUuid, valueName)
    expect(actual.hasError()).toBe(false)
  })
})
