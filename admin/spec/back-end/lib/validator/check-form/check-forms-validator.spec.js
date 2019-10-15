'use strict'
/* global describe, it, expect, spyOn beforeEach */

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
  describe('validate', function () {
    describe('calls single check form, multiple check form validation and validates check form type', () => {
      it('and returns a validation error object with no errors', async () => {
        spyOn(singleCheckFormValidator, 'validate').and.returnValue([])
        spyOn(multipleCheckFormsValidator, 'validate').and.returnValue([])
        const uploadedFiles = [{ filename: 'filename' }]
        const requestData = { checkFormType: 'L' }
        const existingCheckForms = {}
        const validationError = await checkFormValidator.validate(uploadedFiles, requestData, existingCheckForms, checkFormTypes)
        expect(validationError.hasError()).toBeFalsy()
      })
      it('and returns a validation error object with errors occurring from singleCheckFormValidator and multipleCheckFormsValidator validators', async () => {
        spyOn(singleCheckFormValidator, 'validate').and.returnValue(['error1'])
        spyOn(multipleCheckFormsValidator, 'validate').and.returnValue(['error2'])
        const uploadedFiles = [{ filename: 'filename' }]
        const requestData = { checkFormType: 'L' }
        const existingCheckForms = {}
        const validationError = await checkFormValidator.validate(uploadedFiles, requestData, existingCheckForms, checkFormTypes)
        expect(validationError.errors).toEqual({
          csvFiles: ['error1', 'error2']
        })
      })
      it('and returns a validation error object with errors occurring from singleCheckFormValidator and multipleCheckFormsValidator validators', async () => {
        spyOn(singleCheckFormValidator, 'validate').and.returnValue([])
        spyOn(multipleCheckFormsValidator, 'validate').and.returnValue([])
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
