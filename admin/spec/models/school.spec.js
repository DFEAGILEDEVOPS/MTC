'use strict'

/* global beforeEach, describe, it, expect */

const School = require('../../models/school')
const sinon = require('sinon')
require('sinon-mongoose')

// We need to require mongoose which is required by sinon-mongoose in order to override the internal mongoose promise
// library, which is deprecated.
const mongoose = require('mongoose')
mongoose.Promise = global.Promise

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

  it('has a method to provide a school pin', async function (done) {
    expect(typeof School.getUniqueSchoolPin).toBe('function')
    sinon.mock(School)
      .expects('findOne')
      .chain('exec')
      .resolves(null)
    const r1 = await School.getUniqueSchoolPin()
    expect(r1.length).toBe(8)
    School.findOne.restore()
    done()
  })

  it('has a method to provide a school pin - error path', async function (done) {
    sinon.mock(School)
      .expects('findOne')
      .chain('exec')
      .rejects(new Error('something went wrong'))

    try {
      await School.getUniqueSchoolPin()
      done(new Error('failed to catch rejected promise'))
    } catch (err) {
      expect(err.message).toBe('something went wrong')
    }
    School.findOne.restore()
    done()
  })
})
