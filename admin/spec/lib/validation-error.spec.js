'use strict'

/* global describe, it, expect */

const ValidationError = require('../../lib/validation-error')

describe('validation error class', function () {
  it('returns the right object type on new', function () {
    const validationError = new ValidationError()
    expect(validationError instanceof ValidationError).toBe(true)
  })

  it('accepts constructor arguments', function () {
    const msg = 'Please check your details'
    const validationError = new ValidationError('foreName', msg)
    expect(validationError.errors.foreName).toBe(msg)
  })

  it('accepts new errors using addError', function () {
    const validationError = new ValidationError()
    const msg = 'Please check your details'
    validationError.addError('lastName', msg)
    expect(validationError.errors.lastName).toBe(msg)
  })

  it('can tell if a field is valid or not using `isError()`', function () {
    const msg = 'Please check your details'
    const validationError = new ValidationError('foreName', msg)
    expect(validationError.isError('foreName')).toBe(true)
    expect(validationError.isError('lastName')).toBe(false)
  })

  it('can retrieve an error message using `get()`', function () {
    const msg = 'Please check your details'
    const validationError = new ValidationError('foreName', msg)
    expect(validationError.get('foreName')).toBe(msg)
  })

  it('can be queried to see if there are errors or not', function () {
    const msg = 'Please check your details'
    const validationError = new ValidationError('foreName', msg)
    expect(validationError.hasError()).toBe(true)
    const validationError2 = new ValidationError()
    expect(validationError2.hasError()).toBe(false)
  })

  it('can return an array of fields that have errored', function () {
    const msg = 'Please check your details'
    const validationError = new ValidationError('foreName', msg)
    validationError.addError('foo', 'check your foo')
    validationError.addError('bar', 'check your bar')
    validationError.addError('baz', 'check your baz')
    let expectedResult = ['foreName', 'foo', 'bar', 'baz']
    expect(JSON.stringify(validationError.getFields())).toBe(JSON.stringify(expectedResult))
  })

  it('asking for a non-existent error behaves as expected', function () {
    const msg = 'Please check your details'
    const validationError = new ValidationError('foreName', msg)
    expect(validationError.isError('foo')).toBe(false)
    expect(validationError.get('foo')).toBe('')
  })

  it('allows an error to be deleted', function () {
    const validationError = new ValidationError('foo', 'foo msg')
    expect(validationError.isError('foo')).toBe(true)
    validationError.removeError('foo')
    expect(validationError.isError('foo')).toBe(false)
  })

  it('can return a set of unique fields and errors', function () {
    const validationError = new ValidationError('dob-day', 'Please check your date of birth')
    validationError.addError('dob-month', 'Please check your date of birth')
    validationError.addError('dob-year', 'Please check your date of birth')
    // unique is an array of unique fields e.g. the last one (dob-year here)  will win
    let unique = validationError.getUniqueFields()
    expect(unique.length).toBe(1)
  })

  it('allows us to sort the unique fields', function () {
    let arrayToBeSorted = ['three', 'two', 'nine', 'four']
    let sortOrder = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
    let sorted = ValidationError.sortByFieldOrder(arrayToBeSorted, sortOrder)
    expect(sorted[0]).toBe('two')
    expect(sorted[1]).toBe('three')
    expect(sorted[2]).toBe('four')
    expect(sorted[3]).toBe('nine')
  })

  it('does not drop fields when the sort array is a subset of the array to be sorted', function () {
    let arrayToBeSorted = ['three', 'two', 'nine', 'four']
    let sortOrder = ['one', 'three', 'four']
    let sorted = ValidationError.sortByFieldOrder(arrayToBeSorted, sortOrder)
    expect(sorted[0]).toBe('three')
    expect(sorted[1]).toBe('four')
    expect(sorted[2]).toBe('two') // unsorted position
    expect(sorted[3]).toBe('nine') // unsorted position
  })
})
