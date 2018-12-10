const R = require('ramda')

const config = require('../../../config')
const checkFormErrorMessages = require('../../errors/check-form')

const multipleCheckFormsValidator = {}

/**
 * Multiple check forms data validation
 * @param uploadedFiles
 * @param existingCheckForms
 * @param checkFormType
 * @returns Array - list of errors
 */
multipleCheckFormsValidator.validate = (uploadedFiles, existingCheckForms, checkFormType) => {
  // Duplicate file name(s)
  const csvErrors = []
  const checkFormNames = R.concat(R.map(ncf => ncf && ncf.filename.replace(/\.[^/.]+$/, ''), uploadedFiles), R.map(ecf => ecf && ecf.name, existingCheckForms))
  const duplicateCheckFormNames = R.uniq(checkFormNames.filter((item, pos) => checkFormNames.indexOf(item) !== pos))
  if (duplicateCheckFormNames.length > 0) {
    duplicateCheckFormNames.forEach(duplicateName =>
      csvErrors.push(`${duplicateName} ${checkFormErrorMessages.duplicateCheckFormName}`)
    )
  }
  // Max file number limit
  if (uploadedFiles.length > config.MAX_CHECK_FORM_FILES_SINGLE_UPLOAD) {
    csvErrors.push(checkFormErrorMessages.maxUploadedFiles)
  }
  // Multiple familiarisation check forms
  if (checkFormType === 'F' && uploadedFiles.length > 1) {
    csvErrors.push(checkFormErrorMessages.multipleFamiliarisationForms)
  }
  return csvErrors
}

module.exports = multipleCheckFormsValidator
