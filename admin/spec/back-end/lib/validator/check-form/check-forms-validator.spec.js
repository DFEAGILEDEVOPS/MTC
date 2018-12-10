'use strict'
/* global describe, it, expect, spyOn */

const checkFormErrorMessages = require('../../../../../lib/errors/check-form')
const checkFormValidator = require('../../../../../lib/validator/check-form/check-forms-validator')
const singleCheckFormValidator = require('../../../../../lib/validator/check-form/single-check-form-validator')
const multipleCheckFormsValidator = require('../../../../../lib/validator/check-form/multiple-check-forms-validator')

describe('checkFormValidator', function () {
  describe('validate', function () {
    describe('calls single check form, multiple check form validation and validates check form type', () => {
      it('and returns a validation error object with no errors', async () => {
        spyOn(singleCheckFormValidator, 'validate').and.returnValue([])
        spyOn(multipleCheckFormsValidator, 'validate').and.returnValue([])
        const uploadedFiles = [{ filename: 'filename' }]
        const requestData = { checkFormType: 'L' }
        const existingCheckForms = {}
        const validationError = await checkFormValidator.validate(uploadedFiles, requestData, existingCheckForms)
        expect(validationError.hasError()).toBeFalsy()
      })
      it('and returns a validation error object with errors', async () => {
        spyOn(singleCheckFormValidator, 'validate').and.returnValue(['error1'])
        spyOn(multipleCheckFormsValidator, 'validate').and.returnValue(['error2'])
        const uploadedFiles = [{ filename: 'filename' }]
        const requestData = { checkFormType: '' }
        const existingCheckForms = {}
        const validationError = await checkFormValidator.validate(uploadedFiles, requestData, existingCheckForms)
        expect(validationError.errors).toEqual({
          csvFile: [ 'error1', 'error2' ],
          checkFormType: checkFormErrorMessages.missingCheckFormType
        })
      })
    })
  })
})
