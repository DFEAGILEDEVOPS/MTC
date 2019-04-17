'use strict'
/* global describe, it, expect */

const checkFormErrorMessages = require('../../../../../lib/errors/check-form')
const singleCheckFormValidator = require('../../../../../lib/validator/check-form/single-check-form-validator')

describe('singleCheckFormValidator', function () {
  describe('validate', function () {
    describe('calls single check form, multiple check form validation and validates check form type', () => {
      it('and returns a validation error object with no errors', async () => {
        const uploadedFile = { filename: 'filename.csv', file: 'spec/back-end/mocks/check-forms/check-form-valid.csv' }
        const singleCheckFormErrors = await singleCheckFormValidator.validate(uploadedFile)
        expect(singleCheckFormErrors.length).toEqual(0)
      })
      it('and returns a validation error object when no file is provided', async () => {
        const uploadedFile = {}
        const singleCheckFormErrors = await singleCheckFormValidator.validate(uploadedFile)
        expect(singleCheckFormErrors).toEqual([checkFormErrorMessages.noFile])
      })
      it('and returns a validation error object with incorrect file extension', async () => {
        const uploadedFile = { filename: 'filename.xls', file: 'spec/back-end/mocks/check-forms/check-form-valid.csv' }
        const fileName = uploadedFile.filename.replace(/\.[^/.]+$/, '')
        const singleCheckFormErrors = await singleCheckFormValidator.validate(uploadedFile)
        expect(singleCheckFormErrors).toEqual([`${fileName} ${checkFormErrorMessages.wrongFormat}`])
      })
      it('and returns a validation error object with incorrect integers', async () => {
        const uploadedFile = { filename: 'filename.csv', file: 'spec/back-end/mocks/check-forms/check-form-invalid-integers.csv' }
        const fileName = uploadedFile.filename.replace(/\.[^/.]+$/, '')
        const singleCheckFormErrors = await singleCheckFormValidator.validate(uploadedFile)
        expect(singleCheckFormErrors).toEqual([`${fileName} ${checkFormErrorMessages.invalidIntegers}`])
      })
      it('and returns a validation error object with incorrect number of rows and integers', async () => {
        const uploadedFile = { filename: 'filename.csv', file: 'spec/back-end/mocks/check-forms/check-form-invalid-row-number.csv' }
        const fileName = uploadedFile.filename.replace(/\.[^/.]+$/, '')
        const singleCheckFormErrors = await singleCheckFormValidator.validate(uploadedFile)
        expect(singleCheckFormErrors).toEqual([
          `${fileName} ${checkFormErrorMessages.invalidNumberOfItems}`,
          `${fileName} ${checkFormErrorMessages.invalidNumberOfTotalQuestionFactors}`
        ])
      })
      it('and returns a validation error object with not a readable file', async () => {
        const uploadedFile = { filename: 'filename.csv', file: 'spec/back-end/mocks/check-forms/check-form-invalid.csv' }
        const fileName = uploadedFile.filename.replace(/\.[^/.]+$/, '')
        const singleCheckFormErrors = await singleCheckFormValidator.validate(uploadedFile)
        expect(singleCheckFormErrors).toEqual([`${fileName} ${checkFormErrorMessages.isNotReadable}`])
      })
      it('and returns a validation error object with invalid number of columns', async () => {
        const uploadedFile = { filename: 'filename.csv', file: 'spec/back-end/mocks/check-forms/check-form-invalid-columns.csv' }
        const fileName = uploadedFile.filename.replace(/\.[^/.]+$/, '')
        const singleCheckFormErrors = await singleCheckFormValidator.validate(uploadedFile)
        expect(singleCheckFormErrors).toEqual([
          `${fileName} ${checkFormErrorMessages.invalidNumberOfColumns}`,
          `${checkFormErrorMessages.invalidFileCharacters} ${fileName}`,
          `${fileName} ${checkFormErrorMessages.invalidNumberOfTotalQuestionFactors}`
        ])
      })
      it('and returns a validation error object when a value is null', async () => {
        const uploadedFile = { filename: 'filename.csv', file: 'spec/back-end/mocks/check-forms/check-form-invalid-null-integer.csv' }
        const fileName = uploadedFile.filename.replace(/\.[^/.]+$/, '')
        const singleCheckFormErrors = await singleCheckFormValidator.validate(uploadedFile)
        expect(singleCheckFormErrors).toEqual([
          `${checkFormErrorMessages.invalidFileCharacters} ${fileName}`
        ])
      })
      it('and returns a validation error object with invalid characters', async () => {
        const uploadedFile = { filename: 'filename.csv', file: 'spec/back-end/mocks/check-forms/check-form-invalid-characters.csv' }
        const fileName = uploadedFile.filename.replace(/\.[^/.]+$/, '')
        const singleCheckFormErrors = await singleCheckFormValidator.validate(uploadedFile)
        expect(singleCheckFormErrors).toEqual([`${checkFormErrorMessages.invalidFileCharacters} ${fileName}`])
      })
      it('and returns a validation error object when two or more additional empty rows are found', async () => {
        const uploadedFile = { filename: 'filename.csv', file: 'spec/back-end/mocks/check-forms/check-form-two-blank-rows.csv' }
        const fileName = uploadedFile.filename.replace(/\.[^/.]+$/, '')
        const singleCheckFormErrors = await singleCheckFormValidator.validate(uploadedFile)
        expect(singleCheckFormErrors).toEqual([
          `${fileName} ${checkFormErrorMessages.invalidNumberOfItems}`,
          `${fileName} ${checkFormErrorMessages.invalidNumberOfColumns}`,
          `${checkFormErrorMessages.invalidFileCharacters} ${fileName}`
        ])
      })
    })
  })
})
