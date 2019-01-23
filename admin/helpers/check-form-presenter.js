'use strict'

const dateService = require('../services/date.service')

const checkFormPresenter = {}

/**
 * Fetch data for presenting check forms list
 * @param {Array} checkFormData
 * @returns {Array}
 */
checkFormPresenter.getPresentationListData = (checkFormData) => {
  return checkFormData.map(cf => ({
    checkFormName: cf.name,
    checkFormType: cf.isLiveCheckForm ? 'MTC' : 'Try it out',
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
      familiarisationCheckStartDate: dateService.formatFullGdsDate(cw.familiarisationCheckStartDate),
      familiarisationCheckEndDate: dateService.formatFullGdsDate(cw.familiarisationCheckEndDate),
      checkStartDate: dateService.formatFullGdsDate(cw.checkStartDate),
      checkEndDate: dateService.formatFullGdsDate(cw.checkEndDate),
      familiarisationCheckFormCount: cw['FamiliarisationCheckFormCount'],
      liveCheckFormCount: cw['LiveCheckFormCount']
    })
  })
  return checkWindowData
}

/**
 * Format check window data for the select check forms view
 * @param {Object} checkWindow
 * @param {String} checkFormType
 * @returns {Object}
 */
checkFormPresenter.getPresentationCheckWindowData = (checkWindow, checkFormType) => {
  return {
    name: checkWindow.name,
    urlSlug: checkWindow.urlSlug,
    familiarisationCheckStartDate: dateService.formatFullGdsDate(checkWindow.familiarisationCheckStartDate),
    familiarisationCheckEndDate: dateService.formatFullGdsDate(checkWindow.familiarisationCheckEndDate),
    checkStartDate: dateService.formatFullGdsDate(checkWindow.checkStartDate),
    checkEndDate: dateService.formatFullGdsDate(checkWindow.checkEndDate),
    checkFormTypeTitle: checkFormType === 'live' ? 'Multiplication tables check' : 'Try it out'
  }
}

module.exports = checkFormPresenter
