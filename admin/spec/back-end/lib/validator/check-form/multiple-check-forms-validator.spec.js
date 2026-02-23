'use strict'

const checkFormErrorMessages = require('../../../../../lib/errors/check-form')
const multipleCheckFormsValidator = require('../../../../../lib/validator/check-form/multiple-check-forms-validator')

describe('multipleCheckFormsValidator', function () {
  describe('validate', function () {
    let checkFormTypes
    beforeEach(() => {
      checkFormTypes = {
        familiarisation: 'F',
        live: 'L'
      }
    })
    describe('calls multiple check form validation and validates check form type', () => {
      test('and returns a validation error object with no errors', async () => {
        const uploadedFiles = [
          { filename: 'filename.csv', file: 'spec/back-end/mocks/check-forms/check-form-valid.csv' },
          { filename: 'filename2.csv', file: 'spec/back-end/mocks/check-forms/check-form-valid.csv' }
        ]
        const existingCheckForms = [
          { name: 'checkForm1' },
          { name: 'checkForm2' }
        ]
        const checkFormType = 'L'
        const multipleCheckFormErrors = multipleCheckFormsValidator.validate(uploadedFiles, existingCheckForms, checkFormTypes, checkFormType)
        expect(multipleCheckFormErrors.length).toBe(0)
      })
      test('and returns a validation error object with duplicate check form name error', async () => {
        const uploadedFiles = [
          { filename: 'filename.csv', file: 'spec/back-end/mocks/check-forms/check-form-valid.csv' },
          { filename: 'filename.csv', file: 'spec/back-end/mocks/check-forms/check-form-valid.csv' }
        ]
        const existingCheckForms = [
          { name: 'checkForm1' },
          { name: 'checkForm2' }
        ]
        const checkFormType = 'L'
        const duplicateFileName = uploadedFiles[0].filename.replace(/\.[^/.]+$/, '')
        const multipleCheckFormErrors = multipleCheckFormsValidator.validate(uploadedFiles, existingCheckForms, checkFormTypes, checkFormType)
        expect(multipleCheckFormErrors).toEqual([`${duplicateFileName} ${checkFormErrorMessages.duplicateCheckFormName}`])
      })
      test('and returns a validation error object with max uploaded files reached error', async () => {
        const uploadedFiles = [
          { filename: 'filename.csv', file: 'spec/back-end/mocks/check-forms/check-form-valid.csv' },
          { filename: 'filename1.csv', file: 'spec/back-end/mocks/check-forms/check-form-valid.csv' },
          { filename: 'filename2.csv', file: 'spec/back-end/mocks/check-forms/check-form-valid.csv' },
          { filename: 'filename3.csv', file: 'spec/back-end/mocks/check-forms/check-form-valid.csv' },
          { filename: 'filename4.csv', file: 'spec/back-end/mocks/check-forms/check-form-valid.csv' },
          { filename: 'filename5.csv', file: 'spec/back-end/mocks/check-forms/check-form-valid.csv' },
          { filename: 'filename6.csv', file: 'spec/back-end/mocks/check-forms/check-form-valid.csv' },
          { filename: 'filename7.csv', file: 'spec/back-end/mocks/check-forms/check-form-valid.csv' },
          { filename: 'filename8.csv', file: 'spec/back-end/mocks/check-forms/check-form-valid.csv' },
          { filename: 'filename9.csv', file: 'spec/back-end/mocks/check-forms/check-form-valid.csv' },
          { filename: 'filename10.csv', file: 'spec/back-end/mocks/check-forms/check-form-valid.csv' },
          { filename: 'filename11.csv', file: 'spec/back-end/mocks/check-forms/check-form-valid.csv' }
        ]
        const existingCheckForms = [
          { name: 'checkForm1' },
          { name: 'checkForm2' }
        ]
        const checkFormType = 'L'
        const multipleCheckFormErrors = multipleCheckFormsValidator.validate(uploadedFiles, existingCheckForms, checkFormTypes, checkFormType)
        expect(multipleCheckFormErrors).toEqual([checkFormErrorMessages.maxUploadedFiles])
      })
      test('and returns a validation error object with multiple familiarisation forms error', async () => {
        const uploadedFiles = [
          { filename: 'filename.csv', file: 'spec/back-end/mocks/check-forms/check-form-valid.csv' },
          { filename: 'filename1.csv', file: 'spec/back-end/mocks/check-forms/check-form-valid.csv' }
        ]
        const existingCheckForms = [
          { name: 'checkForm1' },
          { name: 'checkForm2' }
        ]
        const checkFormType = 'F'
        const multipleCheckFormErrors = multipleCheckFormsValidator.validate(uploadedFiles, existingCheckForms, checkFormTypes, checkFormType)
        expect(multipleCheckFormErrors).toEqual([checkFormErrorMessages.multipleFamiliarisationForms])
      })
      test('and returns a validation error object with assigned existing familiarisation form error', async () => {
        const uploadedFiles = [
          { filename: 'filename.csv', file: 'spec/back-end/mocks/check-forms/check-form-valid.csv' }
        ]
        const existingCheckForms = [
          { name: 'checkForm1', checkWindow_id: null, isLiveCheckForm: true },
          { name: 'checkForm2', checkWindow_id: 1, isLiveCheckForm: false }
        ]
        const checkFormType = 'F'
        const multipleCheckFormErrors = multipleCheckFormsValidator.validate(uploadedFiles, existingCheckForms, checkFormTypes, checkFormType)
        expect(multipleCheckFormErrors).toEqual([checkFormErrorMessages.familiarisationFormAssigned])
      })
      test('and returns no validation error object with deleted assigned existing familiarisation form error', async () => {
        const uploadedFiles = [
          { filename: 'filename.csv', file: 'spec/back-end/mocks/check-forms/check-form-valid.csv' }
        ]
        const existingCheckForms = [
          { name: 'checkForm1', checkWindow_id: null, isLiveCheckForm: true },
          { name: 'checkForm2', checkWindow_id: 1, isLiveCheckForm: false, isDeleted: true }
        ]
        const checkFormType = 'F'
        const multipleCheckFormErrors = multipleCheckFormsValidator.validate(uploadedFiles, existingCheckForms, checkFormTypes, checkFormType)
        expect(multipleCheckFormErrors.length).toBe(0)
      })
      test('and returns validation error object with assigned existing familiarisation form error that is not deleted', async () => {
        const uploadedFiles = [
          { filename: 'filename.csv', file: 'spec/back-end/mocks/check-forms/check-form-valid.csv' }
        ]
        const existingCheckForms = [
          { name: 'checkForm1', checkWindow_id: null, isLiveCheckForm: true },
          { name: 'checkForm2', checkWindow_id: 1, isLiveCheckForm: false, isDeleted: true },
          { name: 'checkForm3', checkWindow_id: 1, isLiveCheckForm: false, isDeleted: false }
        ]
        const checkFormType = 'F'
        const multipleCheckFormErrors = multipleCheckFormsValidator.validate(uploadedFiles, existingCheckForms, checkFormTypes, checkFormType)
        expect(multipleCheckFormErrors).toEqual([checkFormErrorMessages.familiarisationFormAssigned])
      })
    })
  })
})
