'use strict'

/* global beforeEach, describe, it, expect */

const ValidationError = require('../../../lib/validation-error')
const errorConverter = require('../../../lib/error-converter')

describe('ErrorConverter class : fromExpressValidator()', function () {
  let exampleResult

  beforeEach(function () {
    exampleResult = {
      foo: {
        param: 'foo',
        msg: 'check your foo',
        value: ''
      },
      bar: {
        param: 'bar',
        msg: 'check your bar',
        value: ''
      },
      baz: {
        param: 'baz',
        msg: 'Check your baz',
        value: ''
      }
    }
  })

  it('has a function to convert from express validator', function () {
    expect(typeof errorConverter.fromExpressValidator).toBe('function')
  })

  it('returns a ValidationError', function () {
    expect(errorConverter.fromExpressValidator(exampleResult) instanceof ValidationError).toBe(true)
  })

  it('contains all the expected errors', function () {
    let err = errorConverter.fromExpressValidator(exampleResult)
    Object.keys(exampleResult).map(k => {
      expect(err.isError(k)).toBe(true)
      expect(err.get(k)).toBe(exampleResult[k].msg)
    })
  })
})
