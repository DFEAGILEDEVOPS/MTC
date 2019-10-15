'use strict'

/* global beforeEach, afterEach, describe, it, expect, spyOn jasmine */
const sinon = require('sinon')

const pupilValidator = require('../../../../lib/validator/pupil-validator')
const pupilDataService = require('../../../../services/data-access/pupil.data.service')
const pupilMock = require('../../mocks/pupil')
const pupilErrors = require('../../../../lib/errors/pupil')

let sandbox

describe('pupil validator', function () {
  let req = null

  function getBody () {
    return {
      urlSlug: 'EE882072-D3FC-46F6-84BC-691BFB1B5722',
      foreName: 'John',
      lastName: 'Smith',
      middleNames: '',
      upn: 'H801200001001',
      'dob-day': '01',
      'dob-month': '02',
      'dob-year': '2010',
      gender: 'M',
      ageReason: ''
    }
  }

  function notAllowed () {
    return [':', ';', ',', '.', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '=']
  }

  beforeEach((done) => {
    req = {
      query: {},
      body: {},
      params: {},
      param: (name) => {
        this.params[name] = name
      }
    }

    // Mock the call to check uniqueness on the pupil
    sandbox = sinon.createSandbox()
    done()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('and the pupil uniqueness check passes', () => {
    beforeEach(() => {
      spyOn(pupilDataService, 'sqlFindOneByUpnAndSchoolId').and.returnValue(undefined)
    })

    it('allows a valid request', async function (done) {
      req.body = getBody()
      const schoolId = 2
      const validationError = await pupilValidator.validate(req.body, schoolId)
      expect(validationError.hasError()).toBe(false)
      done()
    })

    describe('then foreName', () => {
      it('requires a foreName', async function (done) {
        req.body = getBody()
        req.body.foreName = ''
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('foreName')).toBe(true)
        expect(validationError.get('foreName')).toBe(pupilErrors.addPupil.firstNameRequired)
        done()
      })

      it('allows latin chars, hyphen and apostrophe in the forename', async function (done) {
        req.body = getBody()
        req.body.foreName = 'Rén-\'e'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        done()
      })

      it('allows spaces in and around the name', async function (done) {
        req.body = getBody()
        req.body.foreName = ' Pup il '
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        done()
      })

      it('rejects only spaces', async function (done) {
        req.body = getBody()
        req.body.foreName = ' '
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('foreName')).toBe(true)
        expect(validationError.get('foreName')).toBe(pupilErrors.addPupil.firstNameRequired)
        done()
      })

      it('does not allow punctuation in the forename', async function (done) {
        req.body = getBody()
        for (const char of notAllowed()) {
          req.body.foreName = 'Réne' + char
          const schoolId = 2
          const validationError = await pupilValidator.validate(req.body, schoolId)
          expect(validationError.hasError()).toBe(true)
          expect(validationError.isError('foreName')).toBe(true)
          expect(validationError.get('foreName')).toBe(pupilErrors.addPupil.firstNameInvalidCharacters)
        }
        done()
      })

      it('foreName can include numbers', async function (done) {
        req.body = getBody()
        req.body.foreName = 'Smithy99'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('foreName')).toBe(false)
        done()
      })
    })

    describe('then middleNames', () => {
      it('is optional', async (done) => {
        req.body = getBody()
        req.body.middleNames = ''
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('middleNames')).toBe(false)
        done()
      })

      it('allows latin1 hyphen apostrophe and a space', async (done) => {
        req.body = getBody()
        req.body.middleNames = 'Mårk Anthøny Doublé-Barræll\'d'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('middleNames')).toBe(false)
        done()
      })

      it('does not allow punctuation in the middlename', async (done) => {
        req.body = getBody()
        for (const char of notAllowed()) {
          req.body.middleNames = 'Réne' + char
          const schoolId = 2
          const validationError = await pupilValidator.validate(req.body, schoolId)
          expect(validationError.hasError()).toBe(true)
          expect(validationError.isError('middleNames')).toBe(true)
          expect(validationError.get('middleNames')).toBe(pupilErrors.addPupil.middleNameInvalidCharacters)
        }
        done()
      })

      it('middleNames can include numbers', async (done) => {
        req.body = getBody()
        req.body.middleNames = 'Smithy99'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('middleNames')).toBe(false)
        done()
      })
    })

    describe('then lastname', () => {
      it('is required', async (done) => {
        req.body = getBody()
        req.body.lastName = ''
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('lastName')).toBe(true)
        expect(validationError.get('lastName')).toBe(pupilErrors.addPupil.lastNameRequired)
        done()
      })

      it('can include numbers', async (done) => {
        req.body = getBody()
        req.body.lastName = 'Smithy99'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('lastName')).toBe(false)
        done()
      })

      it('allows latin chars, hyphen and apostrophe', async (done) => {
        req.body = getBody()
        req.body.foreName = 'Rén-\'e'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        done()
      })

      it('allows spaces in and around the name', async function (done) {
        req.body = getBody()
        req.body.lastName = ' Pup il '
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        done()
      })

      it('rejects only spaces', async function (done) {
        req.body = getBody()
        req.body.lastName = ' '
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('lastName')).toBe(true)
        expect(validationError.get('lastName')).toBe(pupilErrors.addPupil.lastNameRequired)
        done()
      })

      it('does not allow punctuation', async (done) => {
        req.body = getBody()
        for (const char of notAllowed()) {
          req.body.lastName = 'Réne' + char
          const schoolId = 2
          const validationError = await pupilValidator.validate(req.body, schoolId)
          expect(validationError.hasError()).toBe(true)
          expect(validationError.isError('lastName')).toBe(true)
          expect(validationError.get('lastName')).toBe(pupilErrors.addPupil.lastNameInvalidCharacters)
        }
        done()
      })
    })

    describe('then date of birth:', () => {
      it('accepts single digit days and months', async (done) => {
        req.body = getBody()
        req.body['dob-day'] = '1'
        req.body['dob-month'] = '1'
        req.body['dob-year'] = '2010'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        done()
      })

      it('accepts single digit day', async (done) => {
        req.body = getBody()
        req.body['dob-day'] = '7'
        req.body['dob-month'] = '07'
        req.body['dob-year'] = '2010'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        done()
      })

      it('accepts single digit month', async (done) => {
        req.body = getBody()
        req.body['dob-day'] = '10'
        req.body['dob-month'] = '7'
        req.body['dob-year'] = '2010'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        done()
      })

      it('Can\'t be in the future', async (done) => {
        req.body = getBody()
        req.body['dob-day'] = '01'
        req.body['dob-month'] = '12'
        req.body['dob-year'] = (new Date().getFullYear() + 1).toString()
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBe(true)
        expect(validationError.isError('dob-month')).toBe(true)
        expect(validationError.isError('dob-year')).toBe(true)
        expect(validationError.get('dob-day')).toBe(pupilErrors.addPupil.dobOutOfRange)
        expect(validationError.get('dob-month')).toBe(pupilErrors.addPupil.dobOutOfRange)
        expect(validationError.get('dob-year')).toBe(pupilErrors.addPupil.dobOutOfRange)
        done()
      })

      it('day: can\'t be blank', async (done) => {
        req.body = getBody()
        req.body['dob-day'] = ''
        req.body['dob-month'] = '12'
        req.body['dob-year'] = '2010'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBe(true)
        expect(validationError.isError('dob-month')).toBe(false)
        expect(validationError.isError('dob-year')).toBe(false)
        expect(validationError.get('dob-day')).toBe(pupilErrors.addPupil.dobRequired)
        done()
      })

      it('month: can\'t be blank', async (done) => {
        req.body = getBody()
        req.body['dob-day'] = '21'
        req.body['dob-month'] = ''
        req.body['dob-year'] = '2010'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBe(false)
        expect(validationError.isError('dob-month')).toBe(true)
        expect(validationError.isError('dob-year')).toBe(false)
        expect(validationError.get('dob-month')).toBe(pupilErrors.addPupil.dobRequired)
        done()
      })

      it('year: can\'t be blank', async (done) => {
        req.body = getBody()
        req.body['dob-day'] = '21'
        req.body['dob-month'] = '01'
        req.body['dob-year'] = ''
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBe(false)
        expect(validationError.isError('dob-month')).toBe(false)
        expect(validationError.isError('dob-year')).toBe(true)
        expect(validationError.get('dob-year')).toBe(pupilErrors.addPupil.dobRequired)
        done()
      })
    })

    describe('date of birth:', () => {
      it('Can\'t be in the future', async (done) => {
        req.body = getBody()
        req.body['dob-day'] = '01'
        req.body['dob-month'] = '12'
        req.body['dob-year'] = (new Date().getFullYear() + 1).toString()
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBe(true)
        expect(validationError.isError('dob-month')).toBe(true)
        expect(validationError.isError('dob-year')).toBe(true)
        expect(validationError.get('dob-day')).toBe(pupilErrors.addPupil.dobOutOfRange)
        expect(validationError.get('dob-month')).toBe(pupilErrors.addPupil.dobOutOfRange)
        expect(validationError.get('dob-year')).toBe(pupilErrors.addPupil.dobOutOfRange)
        done()
      })

      it('month: must be numerical', async (done) => {
        req.body = getBody()
        req.body['dob-day'] = '02'
        req.body['dob-month'] = 'a'
        req.body['dob-year'] = '2010'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBe(false)
        expect(validationError.isError('dob-month')).toBe(true)
        expect(validationError.isError('dob-year')).toBe(false)
        expect(validationError.get('dob-month')).toBe(pupilErrors.addPupil.dobInvalidChars)
        done()
      })

      it('year: must be numerical', async (done) => {
        req.body = getBody()
        req.body['dob-day'] = '02'
        req.body['dob-month'] = '12'
        req.body['dob-year'] = 'a'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBe(false)
        expect(validationError.isError('dob-month')).toBe(false)
        expect(validationError.isError('dob-year')).toBe(true)
        expect(validationError.get('dob-year')).toBe(pupilErrors.addPupil.dobInvalidChars)
        done()
      })

      it('invalid date should be rejected', async (done) => {
        req.body = getBody()
        req.body['dob-day'] = '29'
        req.body['dob-month'] = '02'
        req.body['dob-year'] = '2010'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBe(true)
        expect(validationError.isError('dob-month')).toBe(true)
        expect(validationError.isError('dob-year')).toBe(true)
        expect(validationError.get('dob-year')).toBe(pupilErrors.addPupil['dob-year'])
        expect(validationError.get('dob-month')).toBe(pupilErrors.addPupil['dob-month'])
        expect(validationError.get('dob-day')).toBe(pupilErrors.addPupil['dob-day'])
        done()
      })

      it('day can\'t be more than 2 digits', async (done) => {
        req.body = getBody()
        req.body['dob-day'] = '022'
        req.body['dob-month'] = '02'
        req.body['dob-year'] = '2010'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBe(true)
        expect(validationError.isError('dob-month')).toBe(false)
        expect(validationError.isError('dob-year')).toBe(false)
        expect(validationError.get('dob-day')).toBe(pupilErrors.addPupil['dob-day'])
        done()
      })

      it('month can\'t be more than 2 digits', async (done) => {
        req.body = getBody()
        req.body['dob-day'] = '02'
        req.body['dob-month'] = '010'
        req.body['dob-year'] = '2010'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBe(false)
        expect(validationError.isError('dob-month')).toBe(true)
        expect(validationError.isError('dob-year')).toBe(false)
        expect(validationError.get('dob-month')).toBe(pupilErrors.addPupil['dob-month'])
        done()
      })

      it('year must be 4 digits', async (done) => {
        req.body = getBody()
        req.body['dob-day'] = '02'
        req.body['dob-month'] = '10'
        req.body['dob-year'] = '20101'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBe(false)
        expect(validationError.isError('dob-month')).toBe(false)
        expect(validationError.isError('dob-year')).toBe(true)
        expect(validationError.get('dob-year')).toBe(pupilErrors.addPupil['dob-year'])
        done()
      })
    })

    describe('date of birth:', () => {
      beforeEach(function () {
        jasmine.clock().install()
      })
      afterEach(function () {
        jasmine.clock().uninstall()
      })
      it('should be out of accepted range if the input date is before 2nd September of 11 years before the academic year', async (done) => {
        const currentYear = (new Date()).getFullYear()
        const baseTime = new Date(currentYear, 11, 31)
        jasmine.clock().mockDate(baseTime)
        req.body = getBody()
        req.body['dob-day'] = '01'
        req.body['dob-month'] = '09'
        req.body['dob-year'] = (baseTime.getFullYear() - 11).toString()
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBeTruthy()
        expect(validationError.isError('dob-month')).toBeTruthy()
        expect(validationError.isError('dob-year')).toBeTruthy()
        expect(validationError.get('dob-day')).toBe(pupilErrors.addPupil.dobOutOfRange)
        expect(validationError.get('dob-month')).toBe(pupilErrors.addPupil.dobOutOfRange)
        expect(validationError.get('dob-year')).toBe(pupilErrors.addPupil.dobOutOfRange)
        done()
      })
      it('should be out of accepted range if the input date is after 1nd September of 7 years before the academic year', async (done) => {
        const currentYear = (new Date()).getFullYear()
        const baseTime = new Date(currentYear, 11, 31)
        jasmine.clock().mockDate(baseTime)
        req.body = getBody()
        req.body['dob-day'] = '02'
        req.body['dob-month'] = '09'
        req.body['dob-year'] = (baseTime.getFullYear() - 7).toString()
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBeTruthy()
        expect(validationError.isError('dob-month')).toBeTruthy()
        expect(validationError.isError('dob-year')).toBeTruthy()
        expect(validationError.get('dob-day')).toBe(pupilErrors.addPupil.dobOutOfRange)
        expect(validationError.get('dob-month')).toBe(pupilErrors.addPupil.dobOutOfRange)
        expect(validationError.get('dob-year')).toBe(pupilErrors.addPupil.dobOutOfRange)
        done()
      })
      it('should display for multiple pupils submission an error message when out of accepted range if the input date is after 1nd September of 7 years before the academic year', async (done) => {
        const currentYear = (new Date()).getFullYear()
        const baseTime = new Date(currentYear, 11, 31)
        const schoolId = 2
        jasmine.clock().mockDate(baseTime)
        req.body = getBody()
        req.body['dob-day'] = '02'
        req.body['dob-month'] = '09'
        req.body['dob-year'] = (baseTime.getFullYear() - 7).toString()
        const validationError = await pupilValidator.validate(req.body, schoolId, true)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBeTruthy()
        expect(validationError.isError('dob-month')).toBeTruthy()
        expect(validationError.isError('dob-year')).toBeTruthy()
        expect(validationError.get('dob-day')).toBe(pupilErrors.addPupil.dobOutOfRange)
        expect(validationError.get('dob-month')).toBe(pupilErrors.addPupil.dobOutOfRange)
        expect(validationError.get('dob-year')).toBe(pupilErrors.addPupil.dobOutOfRange)
        done()
      })
      it('should display for multiple pupils submission an error message when a pupil is year 7 years on the academic year', async (done) => {
        const currentYear = (new Date()).getFullYear()
        const baseTime = new Date(currentYear, 11, 31)
        const schoolId = 2
        jasmine.clock().mockDate(baseTime)
        req.body = getBody()
        req.body['dob-day'] = '31'
        req.body['dob-month'] = '08'
        req.body['dob-year'] = (baseTime.getFullYear() - 7).toString()
        const validationError = await pupilValidator.validate(req.body, schoolId, true)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBeTruthy()
        expect(validationError.isError('dob-month')).toBeTruthy()
        expect(validationError.isError('dob-year')).toBeTruthy()
        expect(validationError.get('dob-day')).toBe(pupilErrors.addPupil.dobMultipleRequiresReason)
        expect(validationError.get('dob-month')).toBe(pupilErrors.addPupil.dobMultipleRequiresReason)
        expect(validationError.get('dob-year')).toBe(pupilErrors.addPupil.dobMultipleRequiresReason)
        done()
      })
      it('should be within the accepted range if the input date is after 2nd September of 11 years before the academic year', async (done) => {
        const currentYear = (new Date()).getFullYear()
        const baseTime = new Date(currentYear, 11, 31)
        const schoolId = 2
        jasmine.clock().mockDate(baseTime)
        req.body = getBody()
        req.body['dob-day'] = '02'
        req.body['dob-month'] = '09'
        req.body['dob-year'] = (baseTime.getFullYear() - 11).toString()
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.isError('dob-day')).toBeFalsy()
        expect(validationError.isError('dob-month')).toBeFalsy()
        expect(validationError.isError('dob-year')).toBeFalsy()
        done()
      })
      it('should require age reason if the input date is at 2nd September of 11 years before the academic year', async (done) => {
        const currentYear = (new Date()).getFullYear()
        const baseTime = new Date(currentYear, 11, 31)
        const schoolId = 2
        jasmine.clock().mockDate(baseTime)
        req.body = getBody()
        req.body['dob-day'] = '02'
        req.body['dob-month'] = '09'
        req.body['dob-year'] = (baseTime.getFullYear() - 11).toString()
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.isError('ageReason')).toBeTruthy()
        done()
      })
      it('should require age reason if the input date is at 31st August of 7 years before the academic year', async (done) => {
        const currentYear = (new Date()).getFullYear()
        const baseTime = new Date(currentYear, 11, 31)
        const schoolId = 2
        jasmine.clock().mockDate(baseTime)
        req.body = getBody()
        req.body['dob-day'] = '31'
        req.body['dob-month'] = '08'
        req.body['dob-year'] = (baseTime.getFullYear() - 7).toString()
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.isError('ageReason')).toBeTruthy()
        done()
      })
      it('should not require age reason if the input date is before 2nd September of 11 years before the academic year', async (done) => {
        const currentYear = (new Date()).getFullYear()
        const baseTime = new Date(currentYear, 11, 31)
        const schoolId = 2
        jasmine.clock().mockDate(baseTime)
        req.body = getBody()
        req.body['dob-day'] = '01'
        req.body['dob-month'] = '09'
        req.body['dob-year'] = (baseTime.getFullYear() - 11).toString()
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.isError('ageReason')).toBeFalsy()
        done()
      })
      it('should not require age reason if the input date is after 1nd September of 7 years before the academic year', async (done) => {
        const currentYear = (new Date()).getFullYear()
        const baseTime = new Date(currentYear, 11, 31)
        const schoolId = 2
        jasmine.clock().mockDate(baseTime)
        req.body = getBody()
        req.body['dob-day'] = '02'
        req.body['dob-month'] = '09'
        req.body['dob-year'] = (baseTime.getFullYear() - 7).toString()
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.isError('ageReason')).toBeFalsy()
        done()
      })
    })

    describe('then gender', () => {
      it('is required', async (done) => {
        req.body = getBody()
        req.body.gender = ''
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('gender')).toBe(true)
        expect(validationError.get('gender')).toBe(pupilErrors.addPupil.genderRequired)
        done()
      })
      it('can be accepted in lowercase', async (done) => {
        req.body = getBody()
        req.body.gender = 'f'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBeFalsy()
        done()
      })
    })

    describe('then UPN validator:', () => {
      it('detects when the UPN is in invalid format', async (done) => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'BADCODE'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toEqual([
          pupilErrors.addPupil.upnInvalidCheckDigit,
          pupilErrors.addPupil.upnInvalidLaCode,
          pupilErrors.addPupil.upnInvalidCharacters5To12,
          pupilErrors.addPupil.upnInvalidCharacter13])
        done()
      })

      it('detects when the UPN has an error in char 1 and 5', async (done) => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'H813E00000121'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toEqual([
          pupilErrors.addPupil.upnInvalidCheckDigit,
          pupilErrors.addPupil.upnInvalidCharacters5To12
        ])
        done()
      })

      it('detects when the UPN has an error in char 6', async (done) => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'H8131-0000121'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toEqual([
          pupilErrors.addPupil.upnInvalidCheckDigit,
          pupilErrors.addPupil.upnInvalidCharacters5To12
        ])
        done()
      })

      it('detects when the UPN has an error in char 7', async (done) => {
        req.body = getBody()
        const schoolId = 2
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'H81311 000121'
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toEqual([
          pupilErrors.addPupil.upnInvalidCheckDigit,
          pupilErrors.addPupil.upnInvalidCharacters5To12
        ])
        done()
      })

      it('detects when the UPN has an error in char 8', async (done) => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'H813111E00121'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toEqual([
          pupilErrors.addPupil.upnInvalidCheckDigit,
          pupilErrors.addPupil.upnInvalidCharacters5To12
        ])
        done()
      })

      it('detects when the UPN has an error in char 9', async (done) => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'H8131111E0121'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toEqual([
          pupilErrors.addPupil.upnInvalidCheckDigit,
          pupilErrors.addPupil.upnInvalidCharacters5To12
        ])
        done()
      })

      it('detects when the UPN has an error in char 10', async (done) => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'H81311111E121'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toEqual([
          pupilErrors.addPupil.upnInvalidCheckDigit,
          pupilErrors.addPupil.upnInvalidCharacters5To12
        ])
        done()
      })

      it('detects when the UPN has an error in char 11', async (done) => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'H813111111E21'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toEqual([
          pupilErrors.addPupil.upnInvalidCheckDigit,
          pupilErrors.addPupil.upnInvalidCharacters5To12
        ])
        done()
      })

      it('detects when the UPN has an error in char 12', async (done) => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'H8131111111E1'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toEqual([
          pupilErrors.addPupil.upnInvalidCheckDigit,
          pupilErrors.addPupil.upnInvalidCharacters5To12
        ])
        done()
      })
      it('detects when the UPN has more than one alphabetic characters between position 5 to 12', async (done) => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'H81311ED111E1'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toEqual([
          pupilErrors.addPupil.upnInvalidCheckDigit,
          pupilErrors.addPupil.upnInvalidCharacters5To12
        ])
        done()
      })

      it('validates the check letter', async (done) => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'H801200001001'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('upn')).toBe(false)
        done()
      })

      it('provides an error message when the check letter is wrong', async (done) => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'Z801200001001'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toEqual([
          pupilErrors.addPupil.upnInvalidCheckDigit
        ])
        done()
      })

      it('provides an error message when the LA code is wrong', async (done) => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'R900400001001'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toEqual([
          pupilErrors.addPupil.upnInvalidLaCode
        ])
        done()
      })

      it('it validates a temporary UPN', async (done) => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'G80120000101A'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        done()
      })

      it('validates a lowercase upn, and uppercases it for the user', async function (done) {
        req.body = getBody()
        req.body.upn = 'g80120000101a '
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        done()
      })

      it('checks for invalid character 13 letter: S', async function (done) {
        req.body = getBody()
        req.body.upn = 'G80120000101S'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toEqual([
          pupilErrors.addPupil.upnInvalidCharacter13
        ])
        done()
      })

      it('checks for invalid character 13 letter: I', async function (done) {
        req.body = getBody()
        req.body.upn = 'G80120000101I'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toEqual([
          pupilErrors.addPupil.upnInvalidCharacter13
        ])
        done()
      })

      it('checks for invalid character 13 letter: O', async function (done) {
        req.body = getBody()
        req.body.upn = 'G80120000101O'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toEqual([
          pupilErrors.addPupil.upnInvalidCharacter13
        ])
        done()
      })

      it('checks for valid character 13 letter: A', async function (done) {
        req.body = getBody()
        req.body.upn = 'G80120000101A'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        done()
      })
    })
  })

  describe('and the pupil uniqueness check fails', () => {
    beforeEach(() => {
      const pupil = Object.assign({}, pupilMock)
      pupil.id = '12345'
      pupil.upn = 'H801200001001'
      spyOn(pupilDataService, 'sqlFindOneByUpnAndSchoolId').and.returnValue(pupil)
    })

    it('it ensures the UPN is unique when adding new pupil', async (done) => {
      req.body = getBody()
      // Make it looks like a new pupil
      req.body.urlSlug = undefined
      const schoolId = 2
      const validationError = await pupilValidator.validate(req.body, schoolId)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('upn')).toBe(true)
      expect(validationError.get('upn')).toEqual([
        pupilErrors.addPupil.upnDuplicate
      ])
      done()
    })

    it('it ensures the UPN is unique when editing pupil', async (done) => {
      req.body = getBody()
      const schoolId = 2
      const validationError = await pupilValidator.validate(req.body, schoolId)
      expect(validationError.hasError()).toBe(false)
      expect(validationError.isError('upn')).toBe(false)
      expect(validationError.get('upn')).toBe('')
      done()
    })
  })
})
