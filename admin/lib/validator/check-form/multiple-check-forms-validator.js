const R = require('ramda')

const config = require('../../../config')
const checkFormErrorMessages = require('../../errors/check-form')

const multipleCheckFormsValidator = {}

/**
 * Multiple check forms data validation
 * @param {Array} uploadedFiles
 * @param {Array} existingCheckForms
 * @param {Object} checkFormTypes
 * @param {String} checkFormType
 * @returns Array - list of errors
 */
multipleCheckFormsValidator.validate = (uploadedFiles, existingCheckForms, checkFormTypes, checkFormType) => {
  // Duplicate file name(s)
  const csvErrors = []
  // Fetch uploaded file names without extensions and stored check form names in a single array
  const checkFormNames = R.concat(R.map(ncf => ncf && ncf.filename.replace(/\.[^/.]+$/, ''), uploadedFiles), R.map(ecf => ecf && ecf.name, existingCheckForms))
  const duplicateCheckFormNames = R.uniq(checkFormNames.filter((item, pos) => checkFormNames.indexOf(item) !== pos))
  const existingFamiliarisationCheckForm = R.find(ecf => ecf && !ecf.isLiveCheckForm, existingCheckForms)
  if (duplicateCheckFormNames.length > 0) {
    duplicateCheckFormNames.forEach(duplicateName =>
      csvErrors.push(`${duplicateName} ${checkFormErrorMessages.duplicateCheckFormName}`)
    )
  }
  // Max file number limit
  if (uploadedFiles.length > config.CHECK_FORM_MAX_FILES_PER_UPLOAD) {
    csvErrors.push(checkFormErrorMessages.maxUploadedFiles)
  }
  // Multiple familiarisation check forms
  if (checkFormType === checkFormTypes.familiarisation && uploadedFiles.length > 1) {
    csvErrors.push(checkFormErrorMessages.multipleFamiliarisationForms)
  }
  // Attempting to overwrite assigned familiarisation check form
  if (checkFormType === checkFormTypes.familiarisation && existingFamiliarisationCheckForm && existingFamiliarisationCheckForm.checkWindow_id) {
    csvErrors.push(checkFormErrorMessages.familiarisationFormAssigned)
  }
  return csvErrors
}

module.exports = multipleCheckFormsValidator
