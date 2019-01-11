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
    canRemoveCheckForm: !cf['checkWindow_id'],
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
    checkWindowAdminStartDate: checkFormData.checkWindowAdminStartDate,
    checkWindowAdminEndDate: checkFormData.checkWindowAdminEndDate,
    canRemoveCheckForm: !checkFormData['checkWindow_id'],
    checkWindowName: checkFormData.checkWindowName,
    formData: JSON.parse(checkFormData.formData),
    urlSlug: checkFormData.urlSlug
  }
}

/**
 * Construct flash message data to be used on check form list view after successful saving
 * @param {Array | Object} uploadData
 * @returns {Object}
 */
checkFormPresenter.getFlashMessageData = (uploadData) => {
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

/**
 * Format check window list data for the assign forms to check windows view
 * @param {Array} checkWindows
 * @returns {Array}
 */
checkFormPresenter.getPresentationCheckWindowListData = (checkWindows) => {
  const checkWindowData = []
  checkWindows.forEach(cw => {
    checkWindowData.push({
      name: cw.name,
      urlSlug: cw.urlSlug,
      familiarisationCheckStartDate: cw.familiarisationCheckStartDate.format('D MMMM'),
      familiarisationCheckEndDate: cw.familiarisationCheckEndDate.format('D MMMM YYYY'),
      checkStartDate: cw.checkStartDate.format('D MMMM'),
      checkEndDate: cw.checkEndDate.format('D MMMM YYYY'),
      familiarisationCheckFormCount: cw['FamiliarisationCheckFormCount'],
      liveCheckFormCount: cw['LiveCheckFormCount']
    })
  })
  return checkWindowData
}

module.exports = checkFormPresenter
