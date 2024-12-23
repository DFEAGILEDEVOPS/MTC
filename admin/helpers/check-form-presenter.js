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
    canRemoveCheckForm: !cf.checkWindow_id,
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
    canRemoveCheckForm: !checkFormData.checkWindow_id,
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
      familiarisationCheckFormCount: cw.FamiliarisationCheckFormCount,
      liveCheckFormCount: cw.LiveCheckFormCount
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
  const checkStartDate = checkFormType === 'live' ? checkWindow.checkStartDate : checkWindow.familiarisationCheckStartDate
  return {
    name: checkWindow.name,
    urlSlug: checkWindow.urlSlug,
    familiarisationCheckStartDate: dateService.formatFullGdsDate(checkWindow.familiarisationCheckStartDate),
    familiarisationCheckEndDate: dateService.formatFullGdsDate(checkWindow.familiarisationCheckEndDate),
    liveCheckStartDate: dateService.formatFullGdsDate(checkWindow.checkStartDate),
    liveCheckEndDate: dateService.formatFullGdsDate(checkWindow.checkEndDate),
    checkFormTypeTitle: checkFormType === 'live' ? 'Multiplication tables check' : 'Try it out',
    checkPeriod: checkFormType === 'live' ? 'MTC' : 'Try it out',
    isBeforeCheckType: dateService.utcNowAsMoment().isBefore(checkStartDate)
  }
}

/**
 * Format available and assigned check forms
 * @param {Array} availableCheckForms
 * @param {Array} assignedCheckForms
 * @returns {Array} - checkFormData
 */
checkFormPresenter.getPresentationAvailableFormsData = (availableCheckForms, assignedCheckForms) => {
  const checkFormData = []
  availableCheckForms.forEach(cw => {
    checkFormData.push({
      name: cw.name,
      urlSlug: cw.urlSlug,
      checked: assignedCheckForms.some(acf => acf.urlSlug === cw.urlSlug)
    })
  })
  return checkFormData
}

/**
 * Construct flash message to display assigned check forms after successful assignment
 * @param {Array} checkForms
 * @param {String} checkWindowName
 * @param {String} checkFormType
 * @returns {String} - message
 */
checkFormPresenter.getAssignFormsFlashMessage = (checkForms, checkWindowName, checkFormType) => {
  const totalFormAssigned = checkForms && checkForms.length
  if (!totalFormAssigned && checkFormType === 'familiarisation') {
    return `Check form has been unassigned from ${checkWindowName}, Try it out`
  }
  const partial = totalFormAssigned > 1 ? 'forms have' : 'form has'
  return checkFormType === 'live' ?
    `${totalFormAssigned} ${partial} been assigned to ${checkWindowName}, MTC` :
    `${totalFormAssigned} ${partial} been assigned to ${checkWindowName}, Try it out`
}

module.exports = checkFormPresenter
