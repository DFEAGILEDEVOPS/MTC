'use strict'

/* global beforeEach, describe, it, expect */

const checkFormService = require('../../lib/check-form-service')
const CheckForm = require('../../models/check-form')
const path = require('path')

describe('check form service', function () {
  let checkForm

  beforeEach(function () {
    checkForm = new CheckForm()
  })

  it('should have a populateFromFile() method', function (done) {
    expect(checkFormService.hasOwnProperty('populateFromFile')).toBe(true)
    done()
  })

  it('should throw an error if not called with a csvFile in arg 2', function (done) {
    let promise = checkFormService.populateFromFile(null, null)
    promise.then(function () {
      done(new Error('Promise was resolved when it was expected to be rejected'))
    },
      error => {
        done()
      })
  })

  it('should throw an error if not called with a csvFile in arg 2', function (done) {
    let promise = checkFormService.populateFromFile(checkForm, null)
    promise.then(function () {
      done(new Error('Promise was resolved when it was expected to be rejected'))
    },
    error => {
      done()
    })
  })

  it('should return a promise that resolves', function (done) {
    let csvFile = 'data/fixtures/check-form-1.csv'
    let promise = checkFormService.populateFromFile(checkForm, path.join(__dirname, '/../../', csvFile))
    promise.then((checkForm) => {
      expect(checkForm.questions.length).toBe(10)
        // check last question is 12 x 12
      expect(checkForm.questions[9].f1).toBe(12)
      expect(checkForm.questions[9].f2).toBe(12)
      done()
    },
      (error) => {
        done(error)
      }
    )
  })

  it('should reject a promise when the csv data contains out-of-range numbers', function (done) {
    let csvFile = 'data/fixtures/check-form-2.csv'
    let promise = checkFormService.populateFromFile(checkForm, path.join(__dirname, '/../../', csvFile))
    promise.then((checkForm) => {
        // data contains number < 0 and > 12.  Should fail.
      done(new Error('Promise was resolved, rather than rejected'))
    },
      (error) => {
        done() // success
      }
    )
  })

  it('should reject a promise when the csv data contains non-numeric data', function (done) {
    let csvFile = 'data/fixtures/check-form-3.csv'
    let promise = checkFormService.populateFromFile(checkForm, path.join(__dirname, '/../../', csvFile))
    promise.then((checkForm) => {
        // data contains non-numeric data.  Should fail.
      done(new Error('Promise was resolved, rather than rejected'))
    },
      (error) => {
        done() // success
      }
    )
  })

  it('should reject a promise when the csv data contains a header row', function (done) {
    let csvFile = 'data/fixtures/check-form-4.csv'
    let promise = checkFormService.populateFromFile(checkForm, path.join(__dirname, '/../../', csvFile))
    promise.then((checkForm) => {
        // data contains non-numeric data.  Should fail.
      done(new Error('Promise was resolved, rather than rejected'))
    },
      (error) => {
        done() // success
      }
    )
  }) // This didn't need any code, due to code for test above to test for non-numeric input

  it('should trim values automatically', function (done) {
    let csvFile = 'data/fixtures/check-form-5.csv'
    let promise = checkFormService.populateFromFile(checkForm, path.join(__dirname, '/../../', csvFile))
    promise.then((checkForm) => {
        // Test trim on Q4
      expect(checkForm.questions[4 - 1].f1).toBe(1)

        // Test rtrim() on Q2
      expect(checkForm.questions[2 - 1].f1).toBe(1)

        // Test ltrim() on Q2
      expect(checkForm.questions[2 - 1].f2).toBe(2)

        // Test trim on quoted strings
      expect(checkForm.questions[10 - 1].f1).toBe(12)
      expect(checkForm.questions[10 - 1].f2).toBe(12)

      done() // success
    },
      (error) => {
        done(new Error('Promise was rejected when it should have been resolved : ' + error.message))
      }
    )
  })

  it('should detect if the wrong number of columns are provided', function (done) {
    let csvFile = 'data/fixtures/check-form-6.csv'
    let promise = checkFormService.populateFromFile(checkForm, path.join(__dirname, '/../../', csvFile))
    promise.then((checkForm) => {
      done(new Error('Promise resolved when it should have failed'))
    },
      (error) => {
        expect(error.message).toMatch(/Row is invalid/)
        done() // success
      }
    )
  })
})
