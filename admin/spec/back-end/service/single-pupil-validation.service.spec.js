'use strict'

const singlePupilValidationCSVService = require('../../../services/single-pupil-validation.service')
const PupilValidator = require('../../../lib/validator/pupil-validator')
const ValidationError = require('../../../lib/validation-error')
const addPupilErrorMessages = require('../../../lib/errors/pupil').addPupil
const schoolMock = require('../mocks/school')

describe('single-pupil-validation.service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('generate with valid arguments', () => {
    beforeEach(() => {
      // An empty validation error - indicating no errors at all
      jest.spyOn(PupilValidator, 'validate').mockResolvedValue(new ValidationError())
    })

    test('returns a pupil with no errors', async () => {
      const school = { _id: '001' }
      const data = ['John', 'Lawrence', 'Smith', 'X822200014001', '5/22/2005', 'M']
      const isMultiplePupilsSubmission = true
      singlePupilValidationCSVService.init()
      const { single } = await singlePupilValidationCSVService.validate(data, school, isMultiplePupilsSubmission)
      expect(single).toBeDefined()
      expect(single[6]).toBeUndefined()
    })

    test('detects duplicate upns in the upload file', async () => {
      const pupilCsvData = [
        ['surname', 'firstname', 'middlename', '21/11/2000', 'm', 'Y308212001120'],
        ['surname2', 'firstname2', 'middlename2', '22/11/2001', 'm', 'Y308212001120'] // dup upn!
      ]
      const isMultiplePupilsSubmission = true
      singlePupilValidationCSVService.init()
      // 1st line
      await singlePupilValidationCSVService.validate(pupilCsvData[0], schoolMock, isMultiplePupilsSubmission)
      // 2 line - with the duplicate
      const { single } = await singlePupilValidationCSVService.validate(pupilCsvData[0], schoolMock, isMultiplePupilsSubmission)
      expect(single[6]).toBe(addPupilErrorMessages.upnDuplicateInFile)
    })
  })

  describe('generate with invalid arguments', () => {
    const validationError = new ValidationError()
      .addError('upn', 'UPN invalid (character 13 not a recognised value)')
      .addError('dob-year', 'Date of birth can\'t be in the future')
      .addError('dob-day', 'Date of birth can\'t be in the future')
      .addError('dob-month', 'Date of birth can\'t be in the future')

    beforeEach(() => {
      jest.spyOn(PupilValidator, 'validate').mockResolvedValue(validationError)
    })

    test('returns a pupil with errors', async () => {
      const school = { _id: '001' }
      const data = ['John', 'Lawrence', 'Smith', 'X8222000140011', '5/22/2005', 'M']
      singlePupilValidationCSVService.init()
      const isMultiplePupilsSubmission = true
      const { single } = await singlePupilValidationCSVService.validate(data, school, isMultiplePupilsSubmission)
      expect(single).toBeDefined()
      expect(single[6]).toBeDefined()
      expect(single[6])
        .toBe('UPN invalid (character 13 not a recognised value), Date of birth can\'t be in the future')
    })
  })
})
