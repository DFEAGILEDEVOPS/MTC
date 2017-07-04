'use strict'

/* global beforeEach, describe, it, expect */

const School = require('../../models/school')

describe('school schema', function () {
  let school

  beforeEach(function () {
    school = new School({
      leaCode: 123,
      estabCode: '0001',
      name: 'Ampney Crucis Primary School'
    })
  })

  it('validates a valid document', function (done) {
    school.validate(function (error) {
      expect(error).toBe(null)
      done()
    })
  })

  it('requires an leaCode', function (done) {
    school.leaCode = undefined
    school.validate(error => {
      expect(error.errors.leaCode).toBeDefined()
      done()
    })
  })

  it('requires an estabCode', function (done) {
    school.estabCode = undefined
    school.validate(error => {
      expect(error.errors.estabCode).toBeDefined()
      done()
    })
  })

  it('requires an estabCode to be 4 digits only (over)', function (done) {
    school.estabCode = 12345
    school.validate(error => {
      expect(error.errors.estabCode).toBeDefined()
      done()
    })
  })

  it('requires an estabCode to be 4 digits only (under) ', function (done) {
    school.estabCode = 123
    school.validate(error => {
      expect(error.errors.estabCode).toBeDefined()
      done()
    })
  })

  it('requires an estabCode to digits not alpha', function (done) {
    school.estabCode = 'abcd'
    school.validate(error => {
      expect(error.errors.estabCode).toBeDefined()
      done()
    })
  })

  it('requires a name', function (done) {
    school.name = undefined
    school.validate(error => {
      expect(error.errors.name).toBeDefined()
      done()
    })
  })
})
