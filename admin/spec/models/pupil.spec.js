'use strict'

/* global beforeEach, describe, it, expect */

const Pupil = require('../../models/pupil')
const moment = require('moment')

describe('Pupil schema', function () {
  let pupil
  let school

  beforeEach(function () {
    pupil = new Pupil({
      school: 9999999,
      upn: 'A999999999999',
      foreName: 'Jonny',
      lastName: 'Pupil',
      middleNames: 'Giles',
      gender: 'M',
      // use utc for dob...and ignore the time component
      dob: moment.utc(20060810, 'YYYYMMDD')
    })
  })

  it('validates a correct pupil', function (done) {
    pupil.validate(error => {
      expect(error).toBe(null)
      done()
    })
  })

  it('requires a school ref', function (done) {
    pupil.school = undefined
    pupil.validate(error => {
      expect(error.errors.school).toBeDefined()
      done()
    })
  })

  it('requires a forename', function (done) {
    pupil.foreName = undefined
    pupil.validate(error => {
      expect(error.errors.foreName).toBeDefined()
      done()
    })
  })

  it('requires a lastname', function (done) {
    pupil.lastName = undefined
    pupil.validate(error => {
      expect(error.errors.lastName).toBeDefined()
      done()
    })
  })

  it('has an optional middlename', function (done) {
    pupil.middleNames = undefined
    pupil.validate(error => {
      expect(error).toBe(null)
      done()
    })
  })

  it('requires a gender', function (done) {
    pupil.gender = undefined
    pupil.validate(error => {
      expect(error.errors.gender).toBeDefined()
      done()
    })
  })

  it('requires a gender and it must be M or F', function (done) {
    pupil.gender = 'N'
    pupil.validate(error => {
      expect(error.errors.gender).toBeDefined()
      done()
    })
  })

  it('requires a gender and it must be M or F', function (done) {
    pupil.gender = 'F'
    pupil.validate(error => {
      expect(error).toBe(null)
      done()
    })
  })

  it('requires a dob', function (done) {
    pupil.dob = undefined
    pupil.validate(error => {
      expect(error.errors.dob).toBeDefined()
      done()
    })
  })

  it('has a method to retrieve all pupils', function (done) {
    expect(typeof Pupil.getPupils).toBeDefined()
    expect(typeof Pupil.getPupils).toBe('function')
    done()
  })

  xit('method getPupils returns an object', async function (done) {
    try {
      const pupils = await Pupil.getPupils().limit(1).exec()
      expect(typeof pupils).toEqual('object')
      done()
    } catch (error) {
      done(error)
    }
  })
})
