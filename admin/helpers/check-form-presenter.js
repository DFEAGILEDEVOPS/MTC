'use strict'
const checkFormPresenter = {}

/**
 * Fetch data for presenting check forms list
 * @param {Array} checkFormData
 * @returns {Array}
 */
checkFormPresenter.getPresentationListData = (checkFormData) => {
  return checkFormData.map(cf => ({
    checkFormName: cf.name,
    checkFormType: cf.isLiveCheckForm ? 'Live' : 'Familiarisation',
    createdAt: cf.createdAt.format('YYYY-MM-DD'),
    canRemoveCheckForm: !cf['currentCheckWindow_id'],
    urlSlug: cf.urlSlug
  }))
}

/**
 * Fetch data for presenting single check form
 * @param {Object} checkFormData
 * @returns {Object}
 */
checkFormPresenter.getPresentationCheckFormData = (checkFormData) => {
  const checkFormType = checkFormData.isLiveCheckForm ? 'Live' : 'Familiarisation'
  return {
    checkFormName: checkFormData.name,
    checkFormType,
    createdAt: checkFormData.createdAt.format('DD MMMM YYYY'),
    currentCheckWindowAdminStartDate: checkFormData.adminStartDate,
    currentCheckWindowAdminEndDate: checkFormData.adminEndDate,
    canRemoveCheckForm: !checkFormData['currentCheckWindow_id'],
    currentCheckWindowName: checkFormData.currentCheckWindowName,
    formData: JSON.parse(checkFormData.formData),
    urlSlug: checkFormData.urlSlug
  }
}

/**
 * Construct highlight data to be used on check form list view after successful saving
 * @param {Array | Object} uploadData
 * @returns {Object}
 */
checkFormPresenter.getHighlightData = (uploadData) => {
  const highlightData = {}
  const checkFormsLength = Array.isArray(uploadData) ? uploadData.length : 1
  highlightData.message = `Successfully uploaded ${checkFormsLength} ${checkFormsLength > 1 ? 'forms' : 'form'}`
  highlightData.checkForms = []
  if (Array.isArray(uploadData)) {
    uploadData.forEach(cf => highlightData.checkForms.push({ checkFormName: cf.filename.replace(/\.[^/.]+$/, '') }))
  } else {
    highlightData.checkForms.push({ checkFormName: uploadData.filename.replace(/\.[^/.]+$/, '') })
  }
  return highlightData
}

module.exports = checkFormPresenter
