'use strict'

/* global beforeEach, describe, it, expect */

const Pupil = require('../../models/pupil')
const moment = require('moment')

describe('Pupil schema', function () {
  let pupil

  beforeEach(function () {
    pupil = new Pupil({
      school: 9999999,
      upn: 'A999999999999',
      foreName: 'Jonny',
      lastName: 'Pupil',
      middleNames: 'Giles',
      gender: 'M',
      // use utc for dob...and ignore the time component
      dob: moment.utc(20060810, 'YYYYMMDD'),
      checkOptions: {
        speechSynthesis: false
      }
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

  it('truncates foreName if it\'s too long', function (done) {
    pupil.foreName = 's'.repeat(130)
    pupil.validate(error => {
      expect(error).toBe(null)
      expect(pupil.foreName.length).toBe(128)
      done()
    })
  })

  it('truncates middleNames if it\'s too long', function (done) {
    pupil.middleNames = 's'.repeat(130)
    pupil.validate(error => {
      expect(error).toBe(null)
      expect(pupil.middleNames.length).toBe(128)
      done()
    })
  })

  it('truncates lastName if it\'s too long', function (done) {
    pupil.lastName = 's'.repeat(130)
    pupil.validate(error => {
      expect(error).toBe(null)
      expect(pupil.lastName.length).toBe(128)
      done()
    })
  })

  it('requires a adds in a checkOptions doc if not provided', (done) => {
    pupil.checkOptions = undefined
    pupil.validate(error => {
      expect(pupil.checkOptions.speechSynthesis).toBeFalsy()
      expect(error).toBeFalsy()
      done()
    })
  })

  it('checkOptions auto-populates a speechSynthesis property', (done) => {
    pupil.checkOptions = undefined
    pupil.checkOptions = { randomProp: true }
    pupil.validate(error => {
      expect(error).toBeFalsy()
      expect(pupil.checkOptions.speechSynthesis).toBe(false)
      done()
    })
  })
})
