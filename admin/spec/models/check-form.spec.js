'use strict'

/* global beforeEach, describe, it, expect */

const sinon = require('sinon')
require('sinon-mongoose')
const proxyquire = require('proxyquire')
const httpMocks = require('node-mocks-http')
const CheckForm = require('../../models/check-form')
const checkFormMock = require('../mocks/check-form')
const buildCheckFormName = require('../../models/check-form').buildCheckFormName

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

  describe('check-form schema', function () {
    let sandbox
    let mock
    let next

    beforeEach(function () {
      next = jasmine.createSpy('next')
      spyOn(CheckForm, 'buildCheckFormName').and.returnValue(Promise.resolve({}))
    })

    xit('should create a name following the rules during \'save\' pre-hook', async function (done) {
      buildCheckFormName(saveSpy)
      expect(buildCheckFormName).toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
      done()
    })
  })
})
