'use strict'

const checkFormErrorMessages = require('../../../../../lib/errors/check-form')
const checkFormValidator = require('../../../../../lib/validator/check-form/check-forms-validator')
const singleCheckFormValidator = require('../../../../../lib/validator/check-form/single-check-form-validator')
const multipleCheckFormsValidator = require('../../../../../lib/validator/check-form/multiple-check-forms-validator')

describe('checkFormValidator', function () {
  let checkFormTypes
  beforeEach(() => {
    checkFormTypes = {
      familiarisation: 'F',
      live: 'L'
    }
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('validate', function () {
    describe('calls single check form, multiple check form validation and validates check form type', () => {
      test('and returns a validation error object with no errors', async () => {
        jest.spyOn(singleCheckFormValidator, 'validate').mockResolvedValue([])
        jest.spyOn(multipleCheckFormsValidator, 'validate').mockReturnValue([])
        const uploadedFiles = [{ filename: 'filename' }]
        const requestData = { checkFormType: 'L' }
        const existingCheckForms = {}
        const validationError = await checkFormValidator.validate(uploadedFiles, requestData, existingCheckForms, checkFormTypes)
        expect(validationError.hasError()).toBeFalsy()
      })
      test('and returns a validation error object with errors occurring from singleCheckFormValidator and multipleCheckFormsValidator validators', async () => {
        jest.spyOn(singleCheckFormValidator, 'validate').mockResolvedValue(['error1'])
        jest.spyOn(multipleCheckFormsValidator, 'validate').mockReturnValue(['error2'])
        const uploadedFiles = [{ filename: 'filename' }]
        const requestData = { checkFormType: 'L' }
        const existingCheckForms = {}
        const validationError = await checkFormValidator.validate(uploadedFiles, requestData, existingCheckForms, checkFormTypes)
        expect(validationError.errors).toEqual({
          csvFiles: ['error1', 'error2']
        })
      })
      test('returns a validation error object due to missing check form type', async () => {
        jest.spyOn(singleCheckFormValidator, 'validate').mockResolvedValue([])
        jest.spyOn(multipleCheckFormsValidator, 'validate').mockReturnValue([])
        const uploadedFiles = [{ filename: 'filename' }]
        const requestData = { checkFormType: '' }
        const existingCheckForms = {}
        const validationError = await checkFormValidator.validate(uploadedFiles, requestData, existingCheckForms, checkFormTypes)
        expect(validationError.errors).toEqual({
          checkFormType: checkFormErrorMessages.missingCheckFormType
        })
      })
    })
  })
})
