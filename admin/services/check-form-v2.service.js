const csv = require('fast-csv')

const checkFormV2DataService = require('./data-access/check-form-v2.data.service')
const checkFormsValidator = require('../lib/validator/check-form/check-forms-validator')
const checkFormV2Service = {}

/**
 * Validates and save check form file(s) to the db
 * @param {Array | Object} uploadData
 * @param {Object} requestData
 */
checkFormV2Service.saveCheckForms = async (uploadData, requestData) => {
  // If single file is being uploaded only convert it to an array for consistency
  const uploadedFiles = Array.isArray(uploadData) ? uploadData : [uploadData]
  const existingCheckForms = await checkFormV2DataService.sqlFindAllCheckForms()
  const validationError = await checkFormsValidator.validate(uploadedFiles, requestData, existingCheckForms)
  if (validationError.hasError()) {
    throw validationError
  }
  const checkFormData = await checkFormV2Service.prepareSubmissionData(uploadedFiles, requestData)
  return checkFormV2DataService.sqlInsertCheckForms(checkFormData)
}

/**
 * Prepares data for submission to the db
 * @param uploadedFiles
 * @param requestData
 * @returns checkFormData
 */
checkFormV2Service.prepareSubmissionData = async (uploadedFiles, requestData) => {
  const { checkFormType } = requestData
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

module.exports = checkFormV2Service
