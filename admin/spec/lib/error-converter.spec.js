'use strict'

/* global beforeEach, describe, it, expect */

const Pupil = require('../../models/pupil')
const pupilErrorMessages = require('../../lib/errors/pupil').addPupil
const ValidationError = require('../../lib/validation-error')
const errorConverter = require('../../lib/error-converter')

describe('ErrorConverter class : fromMongoose()', function () {
  let mongooseError
  let validationError
  let data = {foreName: 'Pupil', lastName: 'One'}
  let pupil

  beforeEach(async function () {
    try {
      pupil = new Pupil(data)
      await pupil.validate()
    } catch (error) {
      mongooseError = error
    }
    validationError = new ValidationError()
  })

  it('has a function to convert from mongoose', function () {
    expect(typeof errorConverter.fromMongoose).toBe('function')
  })

  it('throws an error if the mongoose param is not defined', function () {
    expect(function () {
      errorConverter.fromMongoose(null, {}, validationError)
    }).toThrowError(TypeError, 'mongooseError is not defined')
  })

  it('is ok if the validatorError param is not defined', function () {
    expect(function () {
      errorConverter.fromMongoose(mongooseError, {}, null)
    }).not.toThrow()
  })

  it('throws an error if the mongoose param is not the right type', function () {
    expect(function () {
      errorConverter.fromMongoose('a truthy string', {}, validationError)
    }).toThrowError(TypeError, 'mongooseError must be an instanceof MongooseError')

    expect(function () {
      errorConverter.fromMongoose({}, {}, validationError)
    }).toThrowError(TypeError, 'mongooseError must be an instanceof MongooseError')

    expect(function () {
      errorConverter.fromMongoose({errors: {}}, {}, validationError)
    }).toThrowError(TypeError, 'mongooseError must be an instanceof MongooseError')
  })

  it('throws an error if the validation param is not the right type', function () {
    expect(function () {
      errorConverter.fromMongoose(mongooseError, {}, 'a truthy string')
    }).toThrowError(TypeError, 'validationError must be an instanceof ValidationError')
  })

  it('returns a new validation error object with all the mongoose errors converted to friendly errors', function () {
    let newValidationError = errorConverter.fromMongoose(mongooseError, pupilErrorMessages)
    expect(newValidationError instanceof ValidationError).toBe(true)
    expect(newValidationError !== validationError).toBe(true)
    expect(newValidationError.isError('dob')).toBe(true)
    expect(newValidationError.get('dob')).toBe('Path `dob` is required.')
    expect(newValidationError.isError('gender')).toBe(true)
    expect(newValidationError.isError('school')).toBe(true)
  })

  it('returns a new validation error object with all the mongoose errors combined with the validation errors', function () {
    validationError.addError('foo', 'please check your foo')
    validationError.addError('bar', 'please update your bar')
    // use this one to check that validationErrors overwrite mongooose errors. Business logic wins.
    validationError.addError('dob', 'business logic wins over schema validation')
    let newValidationError = errorConverter.fromMongoose(mongooseError, pupilErrorMessages, validationError)
    expect(newValidationError instanceof ValidationError).toBe(true)
    expect(newValidationError !== validationError).toBe(true)
    expect(newValidationError.isError('dob')).toBe(true)
    expect(newValidationError.isError('gender')).toBe(true)
    expect(newValidationError.isError('school')).toBe(true)
    expect(newValidationError.isError('foo')).toBe(true)
    expect(newValidationError.isError('bar')).toBe(true)
    expect(newValidationError.get('dob')).toBe('business logic wins over schema validation')
  })
})

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
