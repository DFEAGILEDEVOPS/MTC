'use strict'

/* global beforeEach, afterEach, describe, it, expect, spyOn */
const sinon = require('sinon')

const pupilValidator = require('../../../lib/validator/pupil-validator')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const pupilMock = require('../../mocks/pupil')

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
      gender: 'M'
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
    sandbox = sinon.sandbox.create()
    done()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('and the pupil uniqueness check passes', () => {
    beforeEach(() => {
      spyOn(pupilDataService, 'sqlFindOneByUpn').and.returnValue(undefined)
    })

    it('allows a valid request', async function (done) {
      req.body = getBody()
      const validationError = await pupilValidator.validate(req.body)
      expect(validationError.hasError()).toBe(false)
      done()
    })

    describe('then foreName', () => {
      it('requires a foreName', async function (done) {
        req.body = getBody()
        req.body.foreName = ''
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('foreName')).toBe(true)
        expect(validationError.get('foreName')).toBe('First name can\'t be blank and can\'t contain more than 128 characters')
        done()
      })

      it('allows latin chars, hyphen and apostrophe in the forename', async function (done) {
        req.body = getBody()
        req.body.foreName = 'Rén-\'e'
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(false)
        done()
      })

      it('allows spaces in and around the name', async function (done) {
        req.body = getBody()
        req.body.foreName = ' Pup il '
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(false)
        done()
      })

      it('rejects only spaces', async function (done) {
        req.body = getBody()
        req.body.foreName = ' '
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('foreName')).toBe(true)
        expect(validationError.get('foreName')).toBe('First name can\'t be blank and can\'t contain more than 128 characters')
        done()
      })

      it('does not allow punctuation in the forename', async function (done) {
        req.body = getBody()
        for (let char of notAllowed()) {
          req.body.foreName = 'Réne' + char
          let validationError = await pupilValidator.validate(req.body)
          expect(validationError.hasError()).toBe(true)
          expect(validationError.isError('foreName')).toBe(true)
          expect(validationError.get('foreName')).toBe('First name can\'t contain special character')
        }
        done()
      })

      it('foreName can include numbers', async function (done) {
        req.body = getBody()
        req.body.foreName = 'Smithy99'
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('foreName')).toBe(false)
        done()
      })
    })

    describe('then middleNames', () => {
      it('is optional', async (done) => {
        req.body = getBody()
        req.body.middleNames = ''
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('middleNames')).toBe(false)
        done()
      })

      it('allows latin1 hyphen apostrophe and a space', async (done) => {
        req.body = getBody()
        req.body.middleNames = 'Mårk Anthøny Doublé-Barræll\'d'
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('middleNames')).toBe(false)
        done()
      })

      it('does not allow punctuation in the middlename', async (done) => {
        req.body = getBody()
        for (let char of notAllowed()) {
          req.body.middleNames = 'Réne' + char
          let validationError = await pupilValidator.validate(req.body)
          expect(validationError.hasError()).toBe(true)
          expect(validationError.isError('middleNames')).toBe(true)
          expect(validationError.get('middleNames')).toBe('Check the middle name does not contain special characters')
        }
        done()
      })

      it('middleNames can include numbers', async (done) => {
        req.body = getBody()
        req.body.middleNames = 'Smithy99'
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('middleNames')).toBe(false)
        done()
      })
    })

    describe('then lastname', () => {
      it('is required', async (done) => {
        req.body = getBody()
        req.body.lastName = ''
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('lastName')).toBe(true)
        expect(validationError.get('lastName')).toBe('Last name can\'t be blank and can\'t contain more than 128 characters')
        done()
      })

      it('can include numbers', async (done) => {
        req.body = getBody()
        req.body.lastName = 'Smithy99'
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('lastName')).toBe(false)
        done()
      })

      it('allows latin chars, hyphen and apostrophe', async (done) => {
        req.body = getBody()
        req.body.foreName = 'Rén-\'e'
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(false)
        done()
      })

      it('allows spaces in and around the name', async function (done) {
        req.body = getBody()
        req.body.lastName = ' Pup il '
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(false)
        done()
      })

      it('rejects only spaces', async function (done) {
        req.body = getBody()
        req.body.lastName = ' '
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('lastName')).toBe(true)
        expect(validationError.get('lastName')).toBe('Last name can\'t be blank and can\'t contain more than 128 characters')
        done()
      })

      it('does not allow punctuation', async (done) => {
        req.body = getBody()
        for (let char of notAllowed()) {
          req.body.lastName = 'Réne' + char
          let validationError = await pupilValidator.validate(req.body)
          expect(validationError.hasError()).toBe(true)
          expect(validationError.isError('lastName')).toBe(true)
          expect(validationError.get('lastName')).toBe('Last name can\'t contain special characters')
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
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(false)
        done()
      })

      it('accepts single digit day', async (done) => {
        req.body = getBody()
        req.body['dob-day'] = '7'
        req.body['dob-month'] = '07'
        req.body['dob-year'] = '2010'
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(false)
        done()
      })

      it('accepts single digit month', async (done) => {
        req.body = getBody()
        req.body['dob-day'] = '10'
        req.body['dob-month'] = '7'
        req.body['dob-year'] = '2010'
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(false)
        done()
      })

      it('Can\'t be in the future', async (done) => {
        req.body = getBody()
        req.body['dob-day'] = '01'
        req.body['dob-month'] = '12'
        req.body['dob-year'] = (new Date().getFullYear() + 1).toString()
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBe(true)
        expect(validationError.isError('dob-month')).toBe(true)
        expect(validationError.isError('dob-year')).toBe(true)
        expect(validationError.get('dob-day')).toBe('Date of birth can\'t be in the future')
        expect(validationError.get('dob-month')).toBe('Date of birth can\'t be in the future')
        expect(validationError.get('dob-year')).toBe('Date of birth can\'t be in the future')
        done()
      })

      it('day: can\'t be blank', async (done) => {
        req.body = getBody()
        req.body['dob-day'] = ''
        req.body['dob-month'] = '12'
        req.body['dob-year'] = '2010'
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBe(true)
        expect(validationError.isError('dob-month')).toBe(false)
        expect(validationError.isError('dob-year')).toBe(false)
        expect(validationError.get('dob-day')).toBe('Date of birth can\'t be blank')
        done()
      })

      it('month: can\'t be blank', async (done) => {
        req.body = getBody()
        req.body['dob-day'] = '21'
        req.body['dob-month'] = ''
        req.body['dob-year'] = '2010'
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBe(false)
        expect(validationError.isError('dob-month')).toBe(true)
        expect(validationError.isError('dob-year')).toBe(false)
        expect(validationError.get('dob-month')).toBe('Date of birth can\'t be blank')
        done()
      })

      it('year: can\'t be blank', async (done) => {
        req.body = getBody()
        req.body['dob-day'] = '21'
        req.body['dob-month'] = '01'
        req.body['dob-year'] = ''
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBe(false)
        expect(validationError.isError('dob-month')).toBe(false)
        expect(validationError.isError('dob-year')).toBe(true)
        expect(validationError.get('dob-year')).toBe('Date of birth can\'t be blank')
        done()
      })
    })

    describe('date of birth:', () => {
      it('Can\'t be in the future', async (done) => {
        req.body = getBody()
        req.body['dob-day'] = '01'
        req.body['dob-month'] = '12'
        req.body['dob-year'] = (new Date().getFullYear() + 1).toString()
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBe(true)
        expect(validationError.isError('dob-month')).toBe(true)
        expect(validationError.isError('dob-year')).toBe(true)
        expect(validationError.get('dob-day')).toBe('Date of birth can\'t be in the future')
        expect(validationError.get('dob-month')).toBe('Date of birth can\'t be in the future')
        expect(validationError.get('dob-year')).toBe('Date of birth can\'t be in the future')
        done()
      })

      it('month: must be numerical', async (done) => {
        req.body = getBody()
        req.body['dob-day'] = '02'
        req.body['dob-month'] = 'a'
        req.body['dob-year'] = '2010'
        let validationError = await pupilValidator.validate(req.body)
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
        let validationError = await pupilValidator.validate(req.body)
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
        req.body['dob-year'] = '2010'
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBe(true)
        expect(validationError.isError('dob-month')).toBe(true)
        expect(validationError.isError('dob-year')).toBe(true)
        expect(validationError.get('dob-year')).toBe('Enter a valid year for date of birth')
        expect(validationError.get('dob-month')).toBe('Enter a valid month for date of birth')
        expect(validationError.get('dob-day')).toBe('Enter a valid day for date of birth')
        done()
      })

      it('day can\'t be more than 2 digits', async (done) => {
        req.body = getBody()
        req.body['dob-day'] = '022'
        req.body['dob-month'] = '02'
        req.body['dob-year'] = '2010'
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBe(true)
        expect(validationError.isError('dob-month')).toBe(false)
        expect(validationError.isError('dob-year')).toBe(false)
        expect(validationError.get('dob-day')).toBe('Enter a valid day for date of birth')
        done()
      })

      it('month can\'t be more than 2 digits', async (done) => {
        req.body = getBody()
        req.body['dob-day'] = '02'
        req.body['dob-month'] = '010'
        req.body['dob-year'] = '2010'
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBe(false)
        expect(validationError.isError('dob-month')).toBe(true)
        expect(validationError.isError('dob-year')).toBe(false)
        expect(validationError.get('dob-month')).toBe('Enter a valid month for date of birth')
        done()
      })

      it('year must be 4 digits', async (done) => {
        req.body = getBody()
        req.body['dob-day'] = '02'
        req.body['dob-month'] = '10'
        req.body['dob-year'] = '20101'
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBe(false)
        expect(validationError.isError('dob-month')).toBe(false)
        expect(validationError.isError('dob-year')).toBe(true)
        expect(validationError.get('dob-year')).toBe('Enter a valid year for date of birth')
        done()
      })
    })

    describe('then gender', () => {
      it('is required', async (done) => {
        req.body = getBody()
        req.body['gender'] = ''
        const validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('gender')).toBe(true)
        expect(validationError.get('gender')).toBe('Gender must be M or F')
        done()
      })
      it('can be accepted in lowercase', async (done) => {
        req.body = getBody()
        req.body['gender'] = 'f'
        const validationError = await pupilValidator.validate(req.body)
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
        const validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toBe('UPN invalid (character 13 not a recognised value)')
        done()
      })

      it('detects when the UPN has an error in char 5', async (done) => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'H813E00000121'
        const validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toBe('UPN invalid (characters 5-12 not all numeric)')
        done()
      })

      it('detects when the UPN has an error in char 6', async (done) => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'H8131-0000121'
        const validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toBe('UPN invalid (characters 5-12 not all numeric)')
        done()
      })

      it('detects when the UPN has an error in char 7', async (done) => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'H81311 000121'
        const validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toBe('UPN invalid (characters 5-12 not all numeric)')
        done()
      })

      it('detects when the UPN has an error in char 8', async (done) => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'H813111E00121'
        const validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toBe('UPN invalid (characters 5-12 not all numeric)')
        done()
      })

      it('detects when the UPN has an error in char 9', async (done) => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'H8131111E0121'
        const validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toBe('UPN invalid (characters 5-12 not all numeric)')
        done()
      })

      it('detects when the UPN has an error in char 10', async (done) => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'H81311111E121'
        const validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toBe('UPN invalid (characters 5-12 not all numeric)')
        done()
      })

      it('detects when the UPN has an error in char 11', async (done) => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'H813111111E21'
        const validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toBe('UPN invalid (characters 5-12 not all numeric)')
        done()
      })

      it('detects when the UPN has an error in char 12', async (done) => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'H8131111111E1'
        const validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toBe('UPN invalid (characters 5-12 not all numeric)')
        done()
      })

      it('validates the check letter', async (done) => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'H801200001001'
        const validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('upn')).toBe(false)
        done()
      })

      it('provides an error message when the check letter is wrong', async (done) => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'Z801200001001'
        const validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toBe('UPN invalid (wrong check letter at character 1)')
        done()
      })

      it('provides an error message when the LA code is wrong', async (done) => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'R900400001001'
        const validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toBe('UPN invalid (characters 2-4 not a recognised LA code)')
        done()
      })

      it('it validates a temporary UPN', async (done) => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'G80120000101A'
        const validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(false)
        done()
      })

      it('validates a lowercase upn, and uppercases it for the user', async function (done) {
        req.body = getBody()
        req.body.upn = 'g80120000101a '
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(false)
        done()
      })

      it('checks for invalid character 13 letter: S', async function (done) {
        req.body = getBody()
        req.body.upn = 'G80120000101S'
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toBe('UPN invalid (character 13 not a recognised value)')
        done()
      })

      it('checks for invalid character 13 letter: I', async function (done) {
        req.body = getBody()
        req.body.upn = 'G80120000101I'
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toBe('UPN invalid (character 13 not a recognised value)')
        done()
      })

      it('checks for invalid character 13 letter: O', async function (done) {
        req.body = getBody()
        req.body.upn = 'G80120000101O'
        let validationError = await pupilValidator.validate(req.body)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('upn')).toBe(true)
        expect(validationError.get('upn')).toBe('UPN invalid (character 13 not a recognised value)')
        done()
      })

      it('checks for valid character 13 letter: A', async function (done) {
        req.body = getBody()
        req.body.upn = 'G80120000101A'
        let validationError = await pupilValidator.validate(req.body)
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
      spyOn(pupilDataService, 'sqlFindOneByUpn').and.returnValue(pupil)
    })

    it('it ensures the UPN is unique when adding new pupil', async (done) => {
      req.body = getBody()
      // Make it looks like a new pupil
      req.body.urlSlug = undefined
      const validationError = await pupilValidator.validate(req.body)
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('upn')).toBe(true)
      expect(validationError.get('upn')).toBe('UPN is a duplicate of a pupil already in your register')
      done()
    })

    it('it ensures the UPN is unique when editing pupil', async (done) => {
      req.body = getBody()
      const validationError = await pupilValidator.validate(req.body)
      expect(validationError.hasError()).toBe(false)
      expect(validationError.isError('upn')).toBe(false)
      expect(validationError.get('upn')).toBe('')
      done()
    })
  })
})
