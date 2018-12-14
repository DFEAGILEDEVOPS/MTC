'use strict'
const moment = require('moment')
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
    createdAt: moment(cf.createdAt).format('YYYY-MM-DD'),
    canRemoveCheckForm: !cf.checkWindow_id,
    urlSlug: cf.urlSlug
  }))
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
