'use strict'
/* global describe, it, expect */

const checkFormErrorMessages = require('../../../../../lib/errors/check-form')
const multipleCheckFormsValidator = require('../../../../../lib/validator/check-form/multiple-check-forms-validator')

describe('multipleCheckFormsValidator', function () {
  describe('validate', function () {
    describe('calls single check form, multiple check form validation and validates check form type', () => {
      it('and returns a validation error object with no errors', async () => {
        const uploadedFiles = [
          { filename: 'filename.csv', file: 'spec/back-end/mocks/check-forms/check-form-invalid.csv' },
          { filename: 'filename2.csv', file: 'spec/back-end/mocks/check-forms/check-form-invalid.csv' },
        ]
        const existingCheckForms = [
          { name: 'checkForm1' },
          { name: 'checkForm2' }
        ]
        const checkFormType = 'L'
        const multipleCheckFormErrors = multipleCheckFormsValidator.validate(uploadedFiles, existingCheckForms, checkFormType)
        expect(multipleCheckFormErrors.length).toBe(0)
      })
      it('and returns a validation error object with duplicate check form name error', async () => {
        const uploadedFiles = [
          { filename: 'filename.csv', file: 'spec/back-end/mocks/check-forms/check-form-invalid.csv' },
          { filename: 'filename.csv', file: 'spec/back-end/mocks/check-forms/check-form-invalid.csv' },
        ]
        const existingCheckForms = [
          { name: 'checkForm1' },
          { name: 'checkForm2' }
        ]
        const checkFormType = 'L'
        const duplicateFileName = uploadedFiles[0].filename.replace(/\.[^/.]+$/, '')
        const multipleCheckFormErrors = multipleCheckFormsValidator.validate(uploadedFiles, existingCheckForms, checkFormType)
        expect(multipleCheckFormErrors).toEqual([`${duplicateFileName} ${checkFormErrorMessages.duplicateCheckFormName}`])
      })
      it('and returns a validation error object with max uploaded files reached error', async () => {
        const uploadedFiles = [
          { filename: 'filename.csv', file: 'spec/back-end/mocks/check-forms/check-form-invalid.csv' },
          { filename: 'filename1.csv', file: 'spec/back-end/mocks/check-forms/check-form-invalid.csv' },
          { filename: 'filename2.csv', file: 'spec/back-end/mocks/check-forms/check-form-invalid.csv' },
          { filename: 'filename3.csv', file: 'spec/back-end/mocks/check-forms/check-form-invalid.csv' },
          { filename: 'filename4.csv', file: 'spec/back-end/mocks/check-forms/check-form-invalid.csv' },
          { filename: 'filename5.csv', file: 'spec/back-end/mocks/check-forms/check-form-invalid.csv' },
          { filename: 'filename6.csv', file: 'spec/back-end/mocks/check-forms/check-form-invalid.csv' },
          { filename: 'filename7.csv', file: 'spec/back-end/mocks/check-forms/check-form-invalid.csv' },
          { filename: 'filename8.csv', file: 'spec/back-end/mocks/check-forms/check-form-invalid.csv' },
          { filename: 'filename9.csv', file: 'spec/back-end/mocks/check-forms/check-form-invalid.csv' },
          { filename: 'filename10.csv', file: 'spec/back-end/mocks/check-forms/check-form-invalid.csv' },
          { filename: 'filename11.csv', file: 'spec/back-end/mocks/check-forms/check-form-invalid.csv' }
        ]
        const existingCheckForms = [
          { name: 'checkForm1' },
          { name: 'checkForm2' }
        ]
        const checkFormType = 'L'
        const multipleCheckFormErrors = multipleCheckFormsValidator.validate(uploadedFiles, existingCheckForms, checkFormType)
        expect(multipleCheckFormErrors).toEqual([checkFormErrorMessages.maxUploadedFiles])
      })
      it('and returns a validation error object with multiple familiarisation forms error', async () => {
        const uploadedFiles = [
          { filename: 'filename.csv', file: 'spec/back-end/mocks/check-forms/check-form-invalid.csv' },
          { filename: 'filename1.csv', file: 'spec/back-end/mocks/check-forms/check-form-invalid.csv' }
        ]
        const existingCheckForms = [
          { name: 'checkForm1' },
          { name: 'checkForm2' }
        ]
        const checkFormType = 'F'
        const multipleCheckFormErrors = multipleCheckFormsValidator.validate(uploadedFiles, existingCheckForms, checkFormType)
        expect(multipleCheckFormErrors).toEqual([checkFormErrorMessages.multipleFamiliarisationForms])
      })
    })
  })
})
