const R = require('ramda')

const checkFormErrorMessages = require('../../errors/check-form')
const multipleCheckFormsValidator = require('./multiple-check-forms-validator')
const singleCheckFormValidator = require('./single-check-form-validator')
const ValidationError = require('../../validation-error')

/**
 * Check form data validation
 * @param {Array} uploadedFiles
 * @param {Object} requestData
 * @param {Array} existingCheckForms
 * @param {Object} checkFormTypes
 * @returns Object - Validation Errors
 */
module.exports.validate = async (uploadedFiles, requestData, existingCheckForms, checkFormTypes) => {
  const { checkFormType } = requestData
  const validationError = new ValidationError()

  const singleFileErrors = await Promise.all(uploadedFiles.map(async (uploadedFile) => singleCheckFormValidator.validate(uploadedFile)))
  const multipleFileErrors = multipleCheckFormsValidator.validate(uploadedFiles, existingCheckForms, checkFormTypes, checkFormType)
  // @ts-ignore ramda doesnt work well with types
  const fileErrors = R.flatten(R.concat(singleFileErrors, multipleFileErrors))
  if (fileErrors.length > 0) {
    validationError.addError('csvFiles', fileErrors)
  }
  // Missing check form type
  if (!checkFormType || (checkFormType !== checkFormTypes.familiarisation && checkFormType !== checkFormTypes.live)) {
    validationError.addError('checkFormType', checkFormErrorMessages.missingCheckFormType)
  }
  return validationError
}
