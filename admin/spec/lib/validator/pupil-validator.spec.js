'use strict'

/* global beforeEach, describe, it, expect */

const pupilValidator = require('../../../lib/validator/pupil-validator')
const expressValidator = require('express-validator')()

describe('pupil validator', function () {
  let req = null

  function getBody () {
    return {
      foreName: 'John',
      lastName: 'Smith',
      middleNames: '',
      upn: '',
      'dob-day': '01',
      'dob-month': '02',
      'dob-year': '2005',
      'gender': 'M'
    }
  }

  function notAllowed () {
    return [':', ';', ',', '.', '!', '@', '#', '$', ' ', '%', '^', '&', '*', '(', ')', '_', '+', '=']
  }

  beforeEach(function (done) {
    req = {
      query: {},
      body: {},
      params: {},
      param: (name) => {
        this.params[name] = name
      }
    }

    return expressValidator(req, {}, function () {
      done()
    })
  })

  it('allows a valid request', async function (done) {
    req.body = getBody()
    let validationError = await pupilValidator.validate(req)
    expect(validationError.hasError()).toBe(false)
    done()
  })

  describe('foreName', () => {
    it('requires a foreName', async function (done) {
      req.body = getBody()
      req.body.foreName = ''
      let validationError = await pupilValidator.validate(req)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('foreName')).toBe(true)
      expect(validationError.get('foreName')).toBe('First name cannot be blank')
      done()
    })

    it('requires foreName to be no more than 35 chars', async function (done) {
      req.body = getBody()
      req.body.foreName = 's'.repeat(36)
      let validationError = await pupilValidator.validate(req)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('foreName')).toBe(true)
      expect(validationError.get('foreName')).toBe('Check the first name')
      done()
    })

    it('allows latin chars, hyphen and apostrophe in the forename', async function (done) {
      req.body = getBody()
      req.body.foreName = 'Rén-\'e'
      let validationError = await pupilValidator.validate(req)
      expect(validationError.hasError()).toBe(false)
      done()
    })

    it('does not allow punctuation in the forename', async function (done) {
      req.body = getBody()
      for (let char of notAllowed()) {
        req.body.foreName = 'Réne' + char
        let validationError = await pupilValidator.validate(req)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('foreName')).toBe(true)
        expect(validationError.get('foreName')).toBe('Check the first name does not contain special characters')
      }
      done()
    })

    it('foreName can include numbers', async function (done) {
      req.body = getBody()
      req.body.foreName = 'Smithy99'
      let validationError = await pupilValidator.validate(req)
      expect(validationError.hasError()).toBe(false)
      expect(validationError.isError('foreName')).toBe(false)
      done()
    })
  })

  describe('middleNames', () => {
    it('is optional', async (done) => {
      req.body = getBody()
      req.body.middleNames = ''
      let validationError = await pupilValidator.validate(req)
      expect(validationError.hasError()).toBe(false)
      expect(validationError.isError('middleNames')).toBe(false)
      done()
    })

    it('allows latin1 hyphen apostrophe and a space', async (done) => {
      req.body = getBody()
      req.body.middleNames = 'Mårk Anthøny Doublé-Barræll\'d'
      let validationError = await pupilValidator.validate(req)
      expect(validationError.hasError()).toBe(false)
      expect(validationError.isError('middleNames')).toBe(false)
      done()
    })

    it('does not allow punctuation in the middlename', async (done) => {
      req.body = getBody()
      for (let char of notAllowed()) {
        req.body.middleNames = 'Réne' + char
        let validationError = await pupilValidator.validate(req)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('middleNames')).toBe(true)
        expect(validationError.get('middleNames')).toBe('Check the middle name does not contain special characters')
      }
      done()
    })

    it('middlenames can be up to 35 chars long', async (done) => {
      req.body = getBody()
      req.body.middleNames = 's'.repeat(36)
      let validationError = await pupilValidator.validate(req)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('middleNames')).toBe(true)
      done()
    })

    it('middleNames can include numbers', async function (done) {
      req.body = getBody()
      req.body.middleNames = 'Smithy99'
      let validationError = await pupilValidator.validate(req)
      expect(validationError.hasError()).toBe(false)
      expect(validationError.isError('middleNames')).toBe(false)
      done()
    })
  })

  describe('lastname', () => {
    it('lastName can be up to 35 chars long', async function (done) {
      req.body = getBody()
      req.body.lastName = 's'.repeat(36)
      let validationError = await pupilValidator.validate(req)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('lastName')).toBe(true)
      done()
    })

    it('lastName can include numbers', async function (done) {
      req.body = getBody()
      req.body.lastName = 'Smithy99'
      let validationError = await pupilValidator.validate(req)
      expect(validationError.hasError()).toBe(false)
      expect(validationError.isError('lastName')).toBe(false)
      done()
    })
  })
})
