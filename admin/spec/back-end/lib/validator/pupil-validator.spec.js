'use strict'

const pupilValidator = require('../../../../lib/validator/pupil-validator')
const pupilDataService = require('../../../../services/data-access/pupil.data.service')
const pupilMock = require('../../mocks/pupil')
const pupilErrors = require('../../../../lib/errors/pupil')
const laCodeService = require('../../../../services/la-code.service')

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
      gender: 'M'
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
    jest.spyOn(laCodeService, 'getLaCodes').mockReturnValue([801, 813])
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('and the pupil uniqueness check passes', () => {
    beforeEach(() => {
      jest.spyOn(pupilDataService, 'sqlFindOneByUpnAndSchoolId').mockReturnValue(undefined)
    })
    afterEach(() => {
      jest.restoreAllMocks()
    })
    test('allows a valid request', async () => {
      req.body = getBody()
      const schoolId = 2
      const validationError = await pupilValidator.validate(req.body, schoolId)
      expect(validationError.hasError()).toBe(false)
    })

    describe('then foreName', () => {
      test('requires a foreName', async () => {
        req.body = getBody()
        req.body.foreName = ''
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('foreName')).toBe(true)
        expect(validationError.get('foreName')).toBe(pupilErrors.addPupil.firstNameRequired)
      })

      test('allows latin chars, hyphen and apostrophe in the forename', async () => {
        req.body = getBody()
        req.body.foreName = 'Rén-\'e'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
      })

      test('allows spaces in and around the name', async () => {
        req.body = getBody()
        req.body.foreName = ' Pup il '
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
      })

      test('rejects only spaces', async () => {
        req.body = getBody()
        req.body.foreName = ' '
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('foreName')).toBe(true)
        expect(validationError.get('foreName')).toBe(pupilErrors.addPupil.firstNameRequired)
      })

      test('does not allow punctuation in the forename', async () => {
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

      test('foreName can include numbers', async () => {
        req.body = getBody()
        req.body.foreName = 'Smithy99'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('foreName')).toBe(false)
      })
    })

    describe('then middleNames', () => {
      test('is optional', async () => {
        req.body = getBody()
        req.body.middleNames = ''
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('middleNames')).toBe(false)
      })

      test('allows latin1 hyphen apostrophe and a space', async () => {
        req.body = getBody()
        req.body.middleNames = 'Mårk Anthøny Doublé-Barræll\'d'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('middleNames')).toBe(false)
      })

      test('does not allow punctuation in the middlename', async () => {
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

      test('middleNames can include numbers', async () => {
        req.body = getBody()
        req.body.middleNames = 'Smithy99'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('middleNames')).toBe(false)
      })
    })

    describe('then lastname', () => {
      test('is required', async () => {
        req.body = getBody()
        req.body.lastName = ''
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('lastName')).toBe(true)
        expect(validationError.get('lastName')).toBe(pupilErrors.addPupil.lastNameRequired)
      })

      test('can include numbers', async () => {
        req.body = getBody()
        req.body.lastName = 'Smithy99'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('lastName')).toBe(false)
      })

      test('allows latin chars, hyphen and apostrophe', async () => {
        req.body = getBody()
        req.body.foreName = 'Rén-\'e'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
      })

      test('allows spaces in and around the name', async () => {
        req.body = getBody()
        req.body.lastName = ' Pup il '
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
      })

      test('rejects only spaces', async () => {
        req.body = getBody()
        req.body.lastName = ' '
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('lastName')).toBe(true)
        expect(validationError.get('lastName')).toBe(pupilErrors.addPupil.lastNameRequired)
      })

      test('does not allow punctuation', async () => {
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
      test('is optional', async () => {
        req.body = getBody()
        req.body.foreNameAlias = ''
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('foreNameAlias')).toBe(false)
      })

      test('allows latin1 hyphen apostrophe and a space', async () => {
        req.body = getBody()
        req.body.foreNameAlias = 'Mårk Anthøny Doublé-Barræll\'d'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('foreNameAlias')).toBe(false)
      })

      test('does not allow punctuation in the middlename', async () => {
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

      test('foreNameAlias can include numbers', async () => {
        req.body = getBody()
        req.body.foreNameAlias = 'Smithy99'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('foreNameAlias')).toBe(false)
      })
    })

    describe('then lastNameAlias', () => {
      test('is optional', async () => {
        req.body = getBody()
        req.body.lastNameAlias = ''
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('lastNameAlias')).toBe(false)
      })

      test('allows latin1 hyphen apostrophe and a space', async () => {
        req.body = getBody()
        req.body.lastNameAlias = 'Mårk Anthøny Doublé-Barræll\'d'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('lastNameAlias')).toBe(false)
      })

      test('does not allow punctuation in the middlename', async () => {
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

      test('lastNameAlias can include numbers', async () => {
        req.body = getBody()
        req.body.lastNameAlias = 'Smithy99'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('lastNameAlias')).toBe(false)
      })
    })

    describe('then date of birth:', () => {
      const validYear = (new Date()).getFullYear() - 9

      test('accepts single digit days and months', async () => {
        req.body = getBody()
        req.body['dob-day'] = '1'
        req.body['dob-month'] = '1'
        req.body['dob-year'] = validYear.toString()
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
      })

      test('accepts single digit day', async () => {
        req.body = getBody()
        req.body['dob-day'] = '7'
        req.body['dob-month'] = '07'
        req.body['dob-year'] = validYear.toString()
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
      })

      test('accepts single digit month', async () => {
        req.body = getBody()
        req.body['dob-day'] = '10'
        req.body['dob-month'] = '7'
        req.body['dob-year'] = validYear.toString()
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
      })

      test('Can\'t be in the future', async () => {
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

      test('day: can\'t be blank', async () => {
        req.body = getBody()
        req.body['dob-day'] = ''
        req.body['dob-month'] = '12'
        req.body['dob-year'] = validYear.toString()
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBe(true)
        expect(validationError.isError('dob-month')).toBe(false)
        expect(validationError.isError('dob-year')).toBe(false)
        expect(validationError.get('dob-day')).toBe(pupilErrors.addPupil.dobRequired)
      })

      test('month: can\'t be blank', async () => {
        req.body = getBody()
        req.body['dob-day'] = '21'
        req.body['dob-month'] = ''
        req.body['dob-year'] = validYear.toString()
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBe(false)
        expect(validationError.isError('dob-month')).toBe(true)
        expect(validationError.isError('dob-year')).toBe(false)
        expect(validationError.get('dob-month')).toBe(pupilErrors.addPupil.dobRequired)
      })

      test('year: can\'t be blank', async () => {
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
      const validYear = (new Date()).getFullYear() - 9

      test('Can\'t be in the future', async () => {
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

      test('month: must be numerical', async () => {
        req.body = getBody()
        req.body['dob-day'] = '02'
        req.body['dob-month'] = 'a'
        req.body['dob-year'] = validYear.toString()
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBe(false)
        expect(validationError.isError('dob-month')).toBe(true)
        expect(validationError.isError('dob-year')).toBe(false)
        expect(validationError.get('dob-month')).toBe(pupilErrors.addPupil.dobInvalidChars)
      })

      test('year: must be numerical', async () => {
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

      test('invalid date should be rejected', async () => {
        req.body = getBody()
        req.body['dob-day'] = '32'
        req.body['dob-month'] = '13'
        req.body['dob-year'] = '200'
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

      test('day can\'t be more than 2 digits', async () => {
        req.body = getBody()
        req.body['dob-day'] = '022'
        req.body['dob-month'] = '02'
        req.body['dob-year'] = validYear.toString()
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBe(true)
        expect(validationError.isError('dob-month')).toBe(false)
        expect(validationError.isError('dob-year')).toBe(false)
        expect(validationError.get('dob-day')).toBe(pupilErrors.addPupil['dob-day'])
      })

      test('month can\'t be more than 2 digits', async () => {
        req.body = getBody()
        req.body['dob-day'] = '02'
        req.body['dob-month'] = '010'
        req.body['dob-year'] = validYear.toString()
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('dob-day')).toBe(false)
        expect(validationError.isError('dob-month')).toBe(true)
        expect(validationError.isError('dob-year')).toBe(false)
        expect(validationError.get('dob-month')).toBe(pupilErrors.addPupil['dob-month'])
      })

      test('year must be 4 digits', async () => {
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

      describe('2024 regressions', () => {
        test('bug 65064', async () => {
          // bug from 2024 live cycle
          jest
            .useFakeTimers()
            .setSystemTime(new Date('2024-06-13'))

          req.body = getBody()
          req.body['dob-day'] = '04'
          req.body['dob-month'] = '12'
          req.body['dob-year'] = '2012'
          const schoolId = 2
          const validationResult = await pupilValidator.validate(req.body, schoolId)
          expect(validationResult.hasError()).toBe(true)

          // clean up
          jest.useRealTimers()
        })

        test('bug 65064', async () => {
          // bug from 2024 live cycle
          jest
            .useFakeTimers()
            .setSystemTime(new Date('2024-06-13'))

          req.body = getBody()
          req.body['dob-day'] = '26'
          req.body['dob-month'] = '12'
          req.body['dob-year'] = '2012'
          const schoolId = 2
          const validationResult = await pupilValidator.validate(req.body, schoolId)
          expect(validationResult.hasError()).toBe(true)

          // clean up
          jest.useRealTimers()
        })
      })
    })

    describe('date of birth:', () => {
      describe('additional 2024 tests', () => {
        const schoolId = 2
        beforeEach(() => {
          jest.useFakeTimers().setSystemTime(new Date(2024, 7, 1)) // run these tests as if on the 1-AUG-24
        })
        afterEach(() => {
          jest.useRealTimers()
          jest.restoreAllMocks()
        })

        test('it prevents a pupil who is too young from being added', async () => {
          // 1 day too young: 6 years 364 days =>  2 Sep 2016
          req.body = getBody()
          req.body['dob-day'] = '02'
          req.body['dob-month'] = '09'
          req.body['dob-year'] = '2016'
          const validationError = await pupilValidator.validate(req.body, schoolId)
          expect(validationError.isError('dob-day')).toBe(true)
          expect(validationError.isError('dob-month')).toBe(true)
          expect(validationError.isError('dob-year')).toBe(true)
        })

        test('it allows the youngest allowable pupil to be added', async () => {
          // Youngest allowable: 7 years 0 days on 1 Sep => 1 Sep 2017
          req.body = getBody()
          req.body['dob-day'] = '01'
          req.body['dob-month'] = '09'
          req.body['dob-year'] = '2016'
          const validationError = await pupilValidator.validate(req.body, schoolId)
          expect(validationError.isError('dob-day')).toBe(false)
          expect(validationError.isError('dob-month')).toBe(false)
          expect(validationError.isError('dob-year')).toBe(false)
        })

        test('it allows the oldest allowable pupil to be added', async () => {
          // Oldest allowable age: 9 years, 364 days => 2 Sep 2013
          req.body = getBody()
          req.body['dob-day'] = '02'
          req.body['dob-month'] = '09'
          req.body['dob-year'] = '2013'
          const validationError = await pupilValidator.validate(req.body, schoolId)
          expect(validationError.isError('dob-day')).toBe(false)
          expect(validationError.isError('dob-month')).toBe(false)
          expect(validationError.isError('dob-year')).toBe(false)
        })

        test('it prevents a pupil who is too old from being added', async () => {
          // Pupil that is too old: 10 years 0 days => 1 Sep 2013
          req.body = getBody()
          req.body['dob-day'] = '01'
          req.body['dob-month'] = '09'
          req.body['dob-year'] = '2013'
          const validationError = await pupilValidator.validate(req.body, schoolId)
          expect(validationError.isError('dob-day')).toBe(true)
          expect(validationError.isError('dob-month')).toBe(true)
          expect(validationError.isError('dob-year')).toBe(true)
        })
      })
    })

    describe('then gender', () => {
      test('is required', async () => {
        req.body = getBody()
        req.body.gender = ''
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(true)
        expect(validationError.isError('gender')).toBe(true)
        expect(validationError.get('gender')).toBe(pupilErrors.addPupil.genderRequired)
      })
      test('can be accepted in lowercase', async () => {
        req.body = getBody()
        req.body.gender = 'f'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBeFalsy()
      })
    })

    describe('then UPN validator:', () => {
      test('detects when the UPN is in invalid format', async () => {
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

      test('detects when the UPN has an error in char 1 and 5', async () => {
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

      test('detects when the UPN has an error in char 6', async () => {
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

      test('detects when the UPN has an error in char 7', async () => {
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

      test('detects when the UPN has an error in char 8', async () => {
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

      test('detects when the UPN has an error in char 9', async () => {
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

      test('detects when the UPN has an error in char 10', async () => {
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

      test('detects when the UPN has an error in char 11', async () => {
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

      test('detects when the UPN has an error in char 12', async () => {
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
      test('detects when the UPN has more than one alphabetic characters between position 5 to 12', async () => {
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

      test('validates the check letter', async () => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'H801200001001'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
        expect(validationError.isError('upn')).toBe(false)
      })

      test('provides an error message when the check letter is wrong', async () => {
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

      test('provides an error message when the LA code is wrong', async () => {
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

      test('it validates a temporary UPN', async () => {
        req.body = getBody()
        // Example UPN taken from
        // https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/270560/Unique_Pupil_Numbers_-_guidance.pdf
        req.body.upn = 'G80120000101A'
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
      })

      test('validates a lowercase upn, and uppercases it for the user', async () => {
        req.body = getBody()
        req.body.upn = 'g80120000101a '
        const schoolId = 2
        const validationError = await pupilValidator.validate(req.body, schoolId)
        expect(validationError.hasError()).toBe(false)
      })

      test('checks for invalid character 13 letter: S', async () => {
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

      test('checks for invalid character 13 letter: I', async () => {
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

      test('checks for invalid character 13 letter: O', async () => {
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

      test('checks for valid character 13 letter: A', async () => {
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
      jest.spyOn(pupilDataService, 'sqlFindOneByUpnAndSchoolId').mockResolvedValue(pupil)
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    test('it ensures the UPN is unique when adding new pupil', async () => {
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

    test('it ensures the UPN is unique when editing pupil', async () => {
      req.body = getBody()
      const schoolId = 2
      const validationError = await pupilValidator.validate(req.body, schoolId)
      expect(validationError.hasError()).toBe(false)
      expect(validationError.isError('upn')).toBe(false)
      expect(validationError.get('upn')).toBe('')
    })
  })
})
