'use strict'

/* global beforeEach, afterEach, describe, it, expect, spyOn jest */
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
      foreNameAlias: 'J',
      lastNameAlias: 'S',
      middleNames: '',
      upn: 'H801200001001',
      'dob-day': '01',
      'dob-month': '02',
      'dob-year': ((new Date()).getFullYear() - 9).toString(),
      gender: 'M',
      ageReason: ''
    }
  }

  function notAllowed () {
    return [':', ';', ',', '.', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '=']
  }

  beforeEach(() => {
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
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('and the pupil uniqueness check passes', () => {
    beforeEach(() => {
      spyOn(pupilDataService, 'sqlFindOneByUpnAndSchoolId').and.returnValue(undefined)
    })

    it('allows a valid request', async () => {
      req.body = getBody()
      const schoolId = 2
      const validationError = await pupilValidator.validate(req.body, schoolId)
      expect(validationError.hasError()).toBe(false)
    })

    describe('then foreName', () => {
      it('requires a foreName', async () => {
        req.body = getBody()
        req.body.foreName = ''
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('foreName')).toBe(true)
        expect(validationError.get('foreName')).toBe(pupilErrors.addPupil.firstNameRequired)
      })

      it('allows latin chars, hyphen and apostrophe in the forename', async () => {
        req.body = getBody()
        req.body.foreName = 'Rén-\'e'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
      })

      it('allows spaces in and around the name', async () => {
        req.body = getBody()
        req.body.foreName = ' Pup il '
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
      })

      it('rejects only spaces', async () => {
        req.body = getBody()
        req.body.foreName = ' '
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('foreName')).toBe(true)
        expect(validationError.get('foreName')).toBe(pupilErrors.addPupil.firstNameRequired)
      })

      it('does not allow punctuation in the forename', async () => {
        req.body = getBody()
        for (const char of notAllowed()) {
          req.body.foreName = 'Réne' + char
          const schoolId = 2
          const validationError = await pupilValidator.validate(req.body, schoolId)
          expect(validationError.hasError()).toBe(true)
          expect(validationError.isError('foreName')).toBe(true)
          expect(validationError.get('foreName')).toBe(pupilErrors.addPupil.firstNameInvalidCharacters)
        }
      })

      it('foreName can include numbers', async () => {
        req.body = getBody()
        req.body.foreName = 'Smithy99'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('foreName')).toBe(false)
      })
    })

    describe('then middleNames', () => {
      it('is optional', async () => {
        req.body = getBody()
        req.body.middleNames = ''
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('middleNames')).toBe(false)
      })

      it('allows latin1 hyphen apostrophe and a space', async () => {
        req.body = getBody()
        req.body.middleNames = 'Mårk Anthøny Doublé-Barræll\'d'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('middleNames')).toBe(false)
      })

      it('does not allow punctuation in the middlename', async () => {
        req.body = getBody()
        for (const char of notAllowed()) {
          req.body.middleNames = 'Réne' + char
          const schoolId = 2
          const validationError = await pupilValidator.validate(req.body, schoolId)
          expect(validationError.hasError()).toBe(true)
          expect(validationError.isError('middleNames')).toBe(true)
          expect(validationError.get('middleNames')).toBe(pupilErrors.addPupil.middleNameInvalidCharacters)
        }
      })

      it('middleNames can include numbers', async () => {
        req.body = getBody()
        req.body.middleNames = 'Smithy99'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('middleNames')).toBe(false)
      })
    })

    describe('then lastname', () => {
      it('is required', async () => {
        req.body = getBody()
        req.body.lastName = ''
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('lastName')).toBe(true)
        expect(validationError.get('lastName')).toBe(pupilErrors.addPupil.lastNameRequired)
      })

      it('can include numbers', async () => {
        req.body = getBody()
        req.body.lastName = 'Smithy99'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('lastName')).toBe(false)
      })

      it('allows latin chars, hyphen and apostrophe', async () => {
        req.body = getBody()
        req.body.foreName = 'Rén-\'e'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
      })

      it('allows spaces in and around the name', async () => {
        req.body = getBody()
        req.body.lastName = ' Pup il '
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
      })

      it('rejects only spaces', async () => {
        req.body = getBody()
        req.body.lastName = ' '
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('lastName')).toBe(true)
        expect(validationError.get('lastName')).toBe(pupilErrors.addPupil.lastNameRequired)
      })

      it('does not allow punctuation', async () => {
        req.body = getBody()
        for (const char of notAllowed()) {
          req.body.lastName = 'Réne' + char
          const schoolId = 2
          const validationError = await pupilValidator.validate(req.body, schoolId)
          expect(validationError.hasError()).toBe(true)
          expect(validationError.isError('lastName')).toBe(true)
          expect(validationError.get('lastName')).toBe(pupilErrors.addPupil.lastNameInvalidCharacters)
        }
      })
    })

    describe('then foreNameAlias', () => {
      it('is optional', async () => {
        req.body = getBody()
        req.body.foreNameAlias = ''
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('foreNameAlias')).toBe(false)
      })

      it('allows latin1 hyphen apostrophe and a space', async () => {
        req.body = getBody()
        req.body.foreNameAlias = 'Mårk Anthøny Doublé-Barræll\'d'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('foreNameAlias')).toBe(false)
      })

      it('does not allow punctuation in the middlename', async () => {
        req.body = getBody()
        for (const char of notAllowed()) {
          req.body.foreNameAlias = 'Réne' + char
          const schoolId = 2
          const validationError = await pupilValidator.validate(req.body, schoolId)
          expect(validationError.hasError()).toBe(true)
          expect(validationError.isError('foreNameAlias')).toBe(true)
          expect(validationError.get('foreNameAlias')).toBe(pupilErrors.addPupil.foreNameAliasInvalidCharacters)
        }
      })

      it('foreNameAlias can include numbers', async () => {
        req.body = getBody()
        req.body.foreNameAlias = 'Smithy99'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('foreNameAlias')).toBe(false)
      })
    })

    describe('then lastNameAlias', () => {
      it('is optional', async () => {
        req.body = getBody()
        req.body.lastNameAlias = ''
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('lastNameAlias')).toBe(false)
      })

      it('allows latin1 hyphen apostrophe and a space', async () => {
        req.body = getBody()
        req.body.lastNameAlias = 'Mårk Anthøny Doublé-Barræll\'d'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('lastNameAlias')).toBe(false)
      })

      it('does not allow punctuation in the middlename', async () => {
        req.body = getBody()
        for (const char of notAllowed()) {
          req.body.lastNameAlias = 'Réne' + char
          const schoolId = 2
          const validationError = await pupilValidator.validate(req.body, schoolId)
          expect(validationError.hasError()).toBe(true)
          expect(validationError.isError('lastNameAlias')).toBe(true)
          expect(validationError.get('lastNameAlias')).toBe(pupilErrors.addPupil.lastNameAliasInvalidCharacters)
        }
      })

      it('lastNameAlias can include numbers', async () => {
        req.body = getBody()
        req.body.lastNameAlias = 'Smithy99'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('lastNameAlias')).toBe(false)
      })
    })

    describe('then date of birth:', () => {
      it('accepts single digit days and months', async () => {
        req.body = getBody()
        req.body['dob-day'] = '1'
        req.body['dob-month'] = '1'
        req.body['dob-year'] = '2010'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
      })

      it('accepts single digit day', async () => {
        req.body = getBody()
        req.body['dob-day'] = '7'
        req.body['dob-month'] = '07'
        req.body['dob-year'] = '2010'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
      })

      it('accepts single digit month', async () => {
        req.body = getBody()
        req.body['dob-day'] = '10'
        req.body['dob-month'] = '7'
        req.body['dob-year'] = '2010'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
      })

      it('Can\'t be in the future', async () => {
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
      })

      it('day: can\'t be blank', async () => {
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
      })

      it('month: can\'t be blank', async () => {
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
      })

      it('year: can\'t be blank', async () => {
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
      })
    })

    describe('date of birth:', () => {
      it('Can\'t be in the future', async () => {
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
      })

      it('month: must be numerical', async () => {
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
      })

      it('year: must be numerical', async () => {
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
      })

      it('invalid date should be rejected', async () => {
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
      })

      it('day can\'t be more than 2 digits', async () => {
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
      })

      it('month can\'t be more than 2 digits', async () => {
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
      })

      it('year must be 4 digits', async () => {
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
      })
    })

    describe('date of birth:', () => {
      it('should be out of accepted range if the input date is before 2nd September of 11 years before the academic year', async () => {
        const currentYear = (new Date()).getFullYear()
        const baseTime = new Date(currentYear, 11, 31)
        Date.now = jest.fn(() => {
          return baseTime
        })
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
      })
      it('should be out of accepted range if the input date is after 1nd September of 7 years before the academic year', async () => {
        const currentYear = (new Date()).getFullYear()
        const baseTime = new Date(currentYear, 11, 31)
        Date.now = jest.fn(() => {
          return baseTime
        })
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
      })
      it('should display for multiple pupils submission an error message when out of accepted range if the input date is after 1nd September of 7 years before the academic year', async () => {
        const currentYear = (new Date()).getFullYear()
        const baseTime = new Date(currentYear, 11, 31)
        const schoolId = 2
        Date.now = jest.fn(() => {
          return baseTime
        })
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
      })
      it('should display for multiple pupils submission an error message when a pupil is year 7 years on the academic year', async () => {
        const currentYear = (new Date()).getFullYear()
        const baseTime = new Date(currentYear, 11, 31)
        const schoolId = 2
        Date.now = jest.fn(() => {
          return baseTime
        })
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
      })
      it('should be within the accepted range if the input date is after 2nd September of 11 years before the academic year', async () => {
        const currentYear = (new Date()).getFullYear()
        const baseTime = new Date(currentYear, 11, 31)
        const schoolId = 2
        Date.now = jest.fn(() => {
          return baseTime
        })
        req.body = getBody()
        req.body['dob-day'] = '02'
        req.body['dob-month'] = '09'
        req.body['dob-year'] = (baseTime.getFullYear() - 11).toString()
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.isError('dob-day')).toBeFalsy()
        expect(validationError.isError('dob-month')).toBeFalsy()
        expect(validationError.isError('dob-year')).toBeFalsy()
      })
      it('should require age reason if the input date is at 2nd September of 11 years before the academic year', async () => {
        const currentYear = (new Date()).getFullYear()
        const baseTime = new Date(currentYear, 11, 31)
        const schoolId = 2
        Date.now = jest.fn(() => {
          return baseTime
        })
        req.body = getBody()
        req.body['dob-day'] = '02'
        req.body['dob-month'] = '09'
        req.body['dob-year'] = (baseTime.getFullYear() - 11).toString()
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.isError('ageReason')).toBeTruthy()
      })
      it('should require age reason if the input date is at 31st August of 7 years before the academic year', async () => {
        const currentYear = (new Date()).getFullYear()
        const baseTime = new Date(currentYear, 11, 31)
        const schoolId = 2
        Date.now = jest.fn(() => {
          return baseTime
        })
        req.body = getBody()
        req.body['dob-day'] = '31'
        req.body['dob-month'] = '08'
        req.body['dob-year'] = (baseTime.getFullYear() - 7).toString()
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.isError('ageReason')).toBeTruthy()
      })
      it('should not require age reason if the input date is before 2nd September of 11 years before the academic year', async () => {
        const currentYear = (new Date()).getFullYear()
        const baseTime = new Date(currentYear, 11, 31)
        const schoolId = 2
        Date.now = jest.fn(() => {
          return baseTime
        })
        req.body = getBody()
        req.body['dob-day'] = '01'
        req.body['dob-month'] = '09'
        req.body['dob-year'] = (baseTime.getFullYear() - 11).toString()
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.isError('ageReason')).toBeFalsy()
      })
      it('should not require age reason if the input date is after 1nd September of 7 years before the academic year', async () => {
        const currentYear = (new Date()).getFullYear()
        const baseTime = new Date(currentYear, 11, 31)
        const schoolId = 2
        Date.now = jest.fn(() => {
          return baseTime
        })
        req.body = getBody()
        req.body['dob-day'] = '02'
        req.body['dob-month'] = '09'
        req.body['dob-year'] = (baseTime.getFullYear() - 7).toString()
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.isError('ageReason')).toBeFalsy()
      })
    })

    describe('then gender', () => {
      it('is required', async () => {
        req.body = getBody()
        req.body.gender = ''
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('gender')).toBe(true)
        expect(validationError.get('gender')).toBe(pupilErrors.addPupil.genderRequired)
      })
      it('can be accepted in lowercase', async () => {
        req.body = getBody()
        req.body.gender = 'f'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        console.log(validationError)
        expect(validationError.hasError()).toBeFalsy()
      })
    })

    describe('then UPN validator:', () => {
      it('detects when the UPN is in invalid format', async () => {
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
      })

      it('detects when the UPN has an error in char 1 and 5', async () => {
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
      })

      it('detects when the UPN has an error in char 6', async () => {
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
      })

      it('detects when the UPN has an error in char 7', async () => {
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
      })

      it('detects when the UPN has an error in char 8', async () => {
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
      })

      it('detects when the UPN has an error in char 9', async () => {
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
      })

      it('detects when the UPN has an error in char 10', async () => {
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
      })

      it('detects when the UPN has an error in char 11', async () => {
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
      })

      it('detects when the UPN has an error in char 12', async () => {
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
      })
      it('detects when the UPN has more than one alphabetic characters between position 5 to 12', async () => {
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
      })

      it('validates the check letter', async () => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'H801200001001'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('upn')).toBe(false)
      })

      it('provides an error message when the check letter is wrong', async () => {
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
      })

      it('provides an error message when the LA code is wrong', async () => {
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
      })

      it('it validates a temporary UPN', async () => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'G80120000101A'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
      })

      it('validates a lowercase upn, and uppercases it for the user', async () => {
        req.body = getBody()
        req.body.upn = 'g80120000101a '
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
      })

      it('checks for invalid character 13 letter: S', async () => {
        req.body = getBody()
        req.body.upn = 'G80120000101S'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toEqual([
          pupilErrors.addPupil.upnInvalidCharacter13
        ])
      })

      it('checks for invalid character 13 letter: I', async () => {
        req.body = getBody()
        req.body.upn = 'G80120000101I'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toEqual([
          pupilErrors.addPupil.upnInvalidCharacter13
        ])
      })

      it('checks for invalid character 13 letter: O', async () => {
        req.body = getBody()
        req.body.upn = 'G80120000101O'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toEqual([
          pupilErrors.addPupil.upnInvalidCharacter13
        ])
      })

      it('checks for valid character 13 letter: A', async () => {
        req.body = getBody()
        req.body.upn = 'G80120000101A'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
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

    it('it ensures the UPN is unique when adding new pupil', async () => {
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
    })

    it('it ensures the UPN is unique when editing pupil', async () => {
      req.body = getBody()
      const schoolId = 2
      const validationError = await pupilValidator.validate(req.body, schoolId)
      expect(validationError.hasError()).toBe(false)
      expect(validationError.isError('upn')).toBe(false)
      expect(validationError.get('upn')).toBe('')
    })
  })
})
