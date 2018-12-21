const csv = require('fast-csv')
const R = require('ramda')

const checkFormPresenter = require('../helpers/check-form-presenter')
const checkFormV2DataService = require('./data-access/check-form-v2.data.service')
const checkFormsValidator = require('../lib/validator/check-form/check-forms-validator')
const checkFormV2Service = {}

const checkFormTypes = {
  familiarisation: 'F',
  live: 'L'
}

/**
 * Validates and save check form file(s) to the db
 * @param {Array | Object} uploadData
 * @param {Object} requestData
 */
checkFormV2Service.saveCheckForms = async (uploadData, requestData) => {
  const { checkFormType } = requestData
  // If single file is being uploaded only convert it to an array for consistency
  const uploadedFiles = Array.isArray(uploadData) ? uploadData : [uploadData]
  const existingCheckForms = await checkFormV2DataService.sqlFindAllCheckForms()
  const validationError = await checkFormsValidator.validate(uploadedFiles, requestData, existingCheckForms, checkFormTypes)
  if (validationError.hasError()) {
    throw validationError
  }
  const isFamiliarisationCheckFormUpdate = checkFormType === checkFormTypes.familiarisation && existingCheckForms.some(ecf => !ecf.isLiveCheckForm)
  const checkFormData = await checkFormV2Service.prepareSubmissionData(uploadedFiles, checkFormType)
  return checkFormV2DataService.sqlInsertCheckForms(checkFormData, isFamiliarisationCheckFormUpdate)
}

/**
 * Prepares data for submission to the db
 * @param {Array} uploadedFiles
 * @param {String} checkFormType
 * @returns checkFormData
 */
checkFormV2Service.prepareSubmissionData = async (uploadedFiles, checkFormType) => {
  return Promise.all(uploadedFiles.map(async uploadedFile => {
    const singleFormData = []
    const checkForm = {}
    return new Promise((resolve, reject) => {
      csv.fromPath(uploadedFile.file, { headers: false, trim: true })
        .on('data', function (row) {
          const question = {}
          question.f1 = parseInt(row[0], 10)
          question.f2 = parseInt(row[1], 10)
          singleFormData.push(question)
        })
        .on('end', function () {
          checkForm.name = uploadedFile.filename.replace(/\.[^/.]+$/, '')
          checkForm.formData = JSON.stringify(singleFormData)
          checkForm.isLiveCheckForm = checkFormType === 'L' ? 1 : 0
          resolve(checkForm)
        })
        .on('error', error => reject(error))
    })
  }))
}

/**
 * Identifies whether a familiarisation check form already exists in the db
 * @returns {Boolean}
 */
checkFormV2Service.hasExistingFamiliarisationCheckForm = async () => {
  const familiarisationCheckForm = await checkFormV2DataService.sqlFindFamiliarisationCheckForm()
  return Boolean(familiarisationCheckForm && familiarisationCheckForm.id)
}

/**
 * Fetches saved check forms and returns the data in the appropriate format for the presentation layer
 * @returns {Promise<*>}
 */
checkFormV2Service.getSavedForms = async () => {
  const savedForms = await checkFormV2DataService.sqlFindActiveCheckForms()
  return checkFormPresenter.getPresentationListData(savedForms)
}

/**
 * Calls relevant data service method to perform soft deletion
 * @param {String} urlSlug
 * @returns {Promise<*>}
 */
checkFormV2Service.deleteCheckForm = async (urlSlug) => {
  return checkFormV2DataService.sqlMarkDeletedCheckForm(urlSlug)
}

/**
 * Fetches check form name
 * @param {String} urlSlug
 * @returns {String}
 */
checkFormV2Service.getCheckFormName = async (urlSlug) => {
  const checkForm = await checkFormV2DataService.sqlFindCheckFormByUrlSlug(urlSlug)
  return R.path(['name'], checkForm)
}

/**
 * Fetches check form
 * @param {String} urlSlug
 * @returns {String}
 */
checkFormV2Service.getCheckForm = async (urlSlug) => {
  const checkForm = await checkFormV2DataService.sqlFindCheckFormByUrlSlug(urlSlug)
  return checkFormPresenter.getPresentationCheckFormData(checkForm)
}

module.exports = checkFormV2Service
