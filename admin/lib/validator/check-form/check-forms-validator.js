const R = require('ramda')

const checkFormErrorMessages = require('../../errors/check-form')
const multipleCheckFormsValidator = require('./multiple-check-forms-validator')
const singleCheckFormValidator = require('./single-check-form-validator')
const ValidationError = require('../../validation-error')

/**
 * Check form data validation
 * @param uploadedFiles
 * @param requestData
 * @param existingCheckForms
 * @returns Object - Validation Errors
 */
module.exports.validate = async (uploadedFiles, requestData, existingCheckForms) => {
  const { checkFormType } = requestData
  let validationError = new ValidationError()

  const singleFileErrors = await Promise.all(uploadedFiles.map(async (uploadedFile) => singleCheckFormValidator.validate(uploadedFile)))
  const multipleFileErrors = multipleCheckFormsValidator.validate(uploadedFiles, existingCheckForms, checkFormType)
  const fileErrors = R.flatten(R.concat(singleFileErrors, multipleFileErrors))
  if (fileErrors.length > 0) {
    validationError.addError('csvFile', fileErrors)
  }
  // Missing check form type
  if (!checkFormType || (checkFormType !== 'L' && checkFormType !== 'F')) {
    validationError.addError('checkFormType', checkFormErrorMessages.missingCheckFormType)
  }
  return validationError
}
