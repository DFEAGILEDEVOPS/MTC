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
      expect(validationError.get('middleNames')).toBe('Middle name cannot contain more than 35 characters')
      done()
    })

    it('middleNames can include numbers', async (done) => {
      req.body = getBody()
      req.body.middleNames = 'Smithy99'
      let validationError = await pupilValidator.validate(req)
      expect(validationError.hasError()).toBe(false)
      expect(validationError.isError('middleNames')).toBe(false)
      done()
    })
  })

  describe('lastname', () => {
    it('is required', async (done) => {
      req.body = getBody()
      req.body.lastName = ''
      let validationError = await pupilValidator.validate(req)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('lastName')).toBe(true)
      expect(validationError.get('lastName')).toBe('Last name cannot be blank')
      done()
    })

    it('can be up to 35 chars long', async (done) => {
      req.body = getBody()
      req.body.lastName = 's'.repeat(36)
      let validationError = await pupilValidator.validate(req)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('lastName')).toBe(true)
      done()
    })

    it('can include numbers', async (done) => {
      req.body = getBody()
      req.body.lastName = 'Smithy99'
      let validationError = await pupilValidator.validate(req)
      expect(validationError.hasError()).toBe(false)
      expect(validationError.isError('lastName')).toBe(false)
      done()
    })

    it('allows latin chars, hyphen and apostrophe', async (done) => {
      req.body = getBody()
      req.body.foreName = 'Rén-\'e'
      let validationError = await pupilValidator.validate(req)
      expect(validationError.hasError()).toBe(false)
      done()
    })

    it('does not allow punctuation', async (done) => {
      req.body = getBody()
      for (let char of notAllowed()) {
        req.body.lastName = 'Réne' + char
        let validationError = await pupilValidator.validate(req)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('lastName')).toBe(true)
        expect(validationError.get('lastName')).toBe('Check last name for special characters')
      }
      done()
    })
  })

  describe('date of birth:', () => {
    it('Can\'t be in the future', async (done) => {
      req.body = getBody()
      req.body['dob-day'] = '01'
      req.body['dob-month'] = '12'
      req.body['dob-year'] = (new Date().getFullYear() + 1)
      let validationError = await pupilValidator.validate(req)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('dob-day')).toBe(true)
      expect(validationError.isError('dob-month')).toBe(true)
      expect(validationError.isError('dob-year')).toBe(true)
      expect(validationError.get('dob-day')).toBe('Date of birth cannot be in the future')
      expect(validationError.get('dob-month')).toBe('Date of birth cannot be in the future')
      expect(validationError.get('dob-year')).toBe('Date of birth cannot be in the future')
      done()
    })

    it('day: can\'t be blank', async (done) => {
      req.body = getBody()
      req.body['dob-day'] = ''
      req.body['dob-month'] = '12'
      req.body['dob-year'] = '2005'
      let validationError = await pupilValidator.validate(req)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('dob-day')).toBe(true)
      expect(validationError.isError('dob-month')).toBe(false)
      expect(validationError.isError('dob-year')).toBe(false)
      expect(validationError.get('dob-day')).toBe('Date of birth cannot be blank')
      done()
    })

    it('month: can\'t be blank', async (done) => {
      req.body = getBody()
      req.body['dob-day'] = '21'
      req.body['dob-month'] = ''
      req.body['dob-year'] = '2005'
      let validationError = await pupilValidator.validate(req)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('dob-day')).toBe(false)
      expect(validationError.isError('dob-month')).toBe(true)
      expect(validationError.isError('dob-year')).toBe(false)
      expect(validationError.get('dob-month')).toBe('Date of birth cannot be blank')
      done()
    })

    it('year: can\'t be blank', async (done) => {
      req.body = getBody()
      req.body['dob-day'] = '21'
      req.body['dob-month'] = '01'
      req.body['dob-year'] = ''
      let validationError = await pupilValidator.validate(req)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('dob-day')).toBe(false)
      expect(validationError.isError('dob-month')).toBe(false)
      expect(validationError.isError('dob-year')).toBe(true)
      expect(validationError.get('dob-year')).toBe('Date of birth cannot be blank')
      done()
    })

    it('day: must be numerical', async (done) => {
      req.body = getBody()
      req.body['dob-day'] = 'a'
      req.body['dob-month'] = '12'
      req.body['dob-year'] = '2005'
      let validationError = await pupilValidator.validate(req)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('dob-day')).toBe(true)
      expect(validationError.isError('dob-month')).toBe(false)
      expect(validationError.isError('dob-year')).toBe(false)
      expect(validationError.get('dob-day')).toBe('Entry must be a number')
      done()
    })

    it('month: must be numerical', async (done) => {
      req.body = getBody()
      req.body['dob-day'] = '02'
      req.body['dob-month'] = 'a'
      req.body['dob-year'] = '2005'
      let validationError = await pupilValidator.validate(req)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('dob-day')).toBe(false)
      expect(validationError.isError('dob-month')).toBe(true)
      expect(validationError.isError('dob-year')).toBe(false)
      expect(validationError.get('dob-month')).toBe('Entry must be a number')
      done()
    })

    it('year: must be numerical', async (done) => {
      req.body = getBody()
      req.body['dob-day'] = '02'
      req.body['dob-month'] = '12'
      req.body['dob-year'] = 'a'
      let validationError = await pupilValidator.validate(req)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('dob-day')).toBe(false)
      expect(validationError.isError('dob-month')).toBe(false)
      expect(validationError.isError('dob-year')).toBe(true)
      expect(validationError.get('dob-year')).toBe('Entry must be a number')
      done()
    })

    it('invalid date should be rejected', async (done) => {
      req.body = getBody()
      req.body['dob-day'] = '29'
      req.body['dob-month'] = '02'
      req.body['dob-year'] = '2005'
      let validationError = await pupilValidator.validate(req)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('dob-day')).toBe(true)
      expect(validationError.isError('dob-month')).toBe(true)
      expect(validationError.isError('dob-year')).toBe(true)
      expect(validationError.get('dob-year')).toBe('Please check “Year”')
      expect(validationError.get('dob-month')).toBe('Please check “Month”')
      expect(validationError.get('dob-day')).toBe('Please check “Day”')
      done()
    })

    it('day can\'t be more than 2 digits', async (done) => {
      req.body = getBody()
      req.body['dob-day'] = '022'
      req.body['dob-month'] = '02'
      req.body['dob-year'] = '2005'
      let validationError = await pupilValidator.validate(req)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('dob-day')).toBe(true)
      expect(validationError.isError('dob-month')).toBe(false)
      expect(validationError.isError('dob-year')).toBe(false)
      expect(validationError.get('dob-day')).toBe('Please check “Day”')
      done()
    })

    it('month can\'t be more than 2 digits', async (done) => {
      req.body = getBody()
      req.body['dob-day'] = '02'
      req.body['dob-month'] = '010'
      req.body['dob-year'] = '2005'
      let validationError = await pupilValidator.validate(req)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('dob-day')).toBe(false)
      expect(validationError.isError('dob-month')).toBe(true)
      expect(validationError.isError('dob-year')).toBe(false)
      expect(validationError.get('dob-month')).toBe('Please check “Month”')
      done()
    })

    it('year must be 4 digits', async (done) => {
      req.body = getBody()
      req.body['dob-day'] = '02'
      req.body['dob-month'] = '10'
      req.body['dob-year'] = '20051'
      let validationError = await pupilValidator.validate(req)
      console.log(validationError)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('dob-day')).toBe(false)
      expect(validationError.isError('dob-month')).toBe(false)
      expect(validationError.isError('dob-year')).toBe(true)
      expect(validationError.get('dob-year')).toBe('Please check “Year”')
      done()
    })
  })
})
