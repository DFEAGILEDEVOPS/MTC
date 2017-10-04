'use strict'

/* global beforeEach, describe, it, expect */

const proxyquire = require('proxyquire').noCallThru()

const CheckForm = proxyquire('../../models/check-form', {
  'mongoose-auto-increment': {
    initialize: () => {},
    plugin: () => {}
  }
})

describe('check-form schema', function () {
  let checkForm

  beforeEach(function () {
    checkForm = new CheckForm({
      questions: [
        { f1: 1, f2: 1 },
        { f1: 1, f2: 2 },
        { f1: 1, f2: 3 },
        { f1: 12, f2: 12 }
      ]
    })
  })

  it('correctly validates a valid model', function (done) {
    checkForm.validate(function (err) {
      expect(err).toBe(null)
      expect(checkForm.name).toBeUndefined()
      done()
    })
  })

  it('requires questions to be supplied', function (done) {
    checkForm.questions = undefined
    checkForm.validate(function (err) {
      expect(err.errors).toBeDefined()
      expect(err.errors.questions).toBeDefined()
      done()
    })
  })

  it('requires factor1 to be supplied in the question', function (done) {
    checkForm.questions[ 0 ].f1 = undefined
    checkForm.validate(function (err) {
      expect(err.errors).toBeDefined()
      expect(err.errors[ 'questions.0.f1' ]).toBeDefined()
      done()
    })
  })

  it('requires factor2 to be supplied in the question', function (done) {
    checkForm.questions[ 0 ].f2 = undefined
    checkForm.validate(function (err) {
      expect(err.errors).toBeDefined()
      expect(err.errors[ 'questions.0.f2' ]).toBeDefined()
      done()
    })
  })

  it('requires factor1 to be above the low range', function (done) {
    checkForm.questions[ 0 ].f1 = 0
    checkForm.validate(function (err) {
      expect(err.errors).toBeDefined()
      expect(err.errors[ 'questions.0.f1' ]).toBeDefined()
      done()
    })
  })

  it('requires factor1 to be below the high range', function (done) {
    checkForm.questions[ 0 ].f1 = 13
    checkForm.validate(function (err) {
      expect(err.errors).toBeDefined()
      expect(err.errors[ 'questions.0.f1' ]).toBeDefined()
      done()
    })
  })

  it('requires factor2 to be above the low range', function (done) {
    checkForm.questions[ 0 ].f2 = 0
    checkForm.validate(function (err) {
      expect(err.errors).toBeDefined()
      expect(err.errors[ 'questions.0.f2' ]).toBeDefined()
      done()
    })
  })

  it('requires factor2 to be below the high range', function (done) {
    checkForm.questions[ 0 ].f2 = 13
    checkForm.validate(function (err) {
      expect(err.errors).toBeDefined()
      expect(err.errors[ 'questions.0.f2' ]).toBeDefined()
      done()
    })
  })

  it('has a method to mark a form as deleted', function (done) {
    expect(typeof checkForm.markAsDeleted).toBe('function')
    done()
  })

  it('marking the form as deleted returns a promise', function (done) {
    checkForm.markAsDeleted()
      .then(res => {
        done()
      },
      error => {
        done(error)
      })
  })

  it('marking the form as deleted rejects the promise if it doesnt get a CheckWindow model in arg1', function (done) {
    checkForm.markAsDeleted()
      .then(data => {
        done(new Error('Promise resolved when it was expected to fail'))
      },
      () => {
        done() // success
      })
  })
})
