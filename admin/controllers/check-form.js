'use strict'

const featureToggles = require('feature-toggles')
const moment = require('moment')

const checkFormService = require('../services/check-form.service')
const checkWindowService = require('../services/check-window.service')
const checkWindowDataService = require('../services/data-access/check-window.data.service')
const dateService = require('../services/date.service')
const logger = require('../services/log.service').getLogger()
const testDeveloperReportService = require('../services/test-developer-report.service')
const config = require('../config')

/**
 * Display landing page for 'test developer' role.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
const getTestDeveloperHomePage = async (req, res, next) => {
  res.locals.pageTitle = 'MTC for test development'
  const isNewCheckFormFeatureToggleEnabled = featureToggles.isFeatureEnabled('newCheckForm')
  try {
    req.breadcrumbs(res.locals.pageTitle)
    res.render('test-developer/test-developer-home', {
      breadcrumbs: '',
      isNewCheckFormFeatureToggleEnabled
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Display initial 'upload and view' check forms page.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
const uploadAndViewFormsPage = async (req, res, next) => {
  res.locals.pageTitle = 'Upload and view forms'
  req.breadcrumbs(res.locals.pageTitle)
  let formData
  try {
    formData = await checkFormService.formatCheckFormsAndWindows()
  } catch (error) {
    return next(error)
  }
  return res.render('test-developer/upload-and-view-forms', {
    forms: formData,
    breadcrumbs: req.breadcrumbs()
  })
}

/**
 * Remove check form.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
const removeCheckForm = async (req, res, next) => {
  const id = req.params.formId
  try {
    await checkFormService.deleteCheckForm(id)
  } catch (error) {
    return next(error)
  }

  res.redirect('/test-developer/upload-and-view-forms')
}

/**
 * Upload check form view.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
const uploadCheckForm = async (req, res, next) => {
  req.breadcrumbs('Upload and view forms', '/test-developer/upload-and-view-forms')
  res.locals.pageTitle = 'Upload new form'
  let error

  try {
    req.breadcrumbs(res.locals.pageTitle)
    res.render('test-developer/upload-new-form', {
      error,
      breadcrumbs: req.breadcrumbs()
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Display check form page.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const displayCheckForm = async (req, res) => {
  req.breadcrumbs('Upload and view forms', '/test-developer/upload-and-view-forms')
  res.locals.pageTitle = 'View form'

  let formData
  let checkWindows
  const formId = req.params.formId

  try {
    formData = await checkFormService.getCheckForm(formId)
    formData.checkWindowsName = []
    formData.canDelete = true
  } catch (error) {
    req.flash('error', `Unable to find check form details for form id ${formId}`)
    return res.redirect('/test-developer/upload-and-view-forms')
  }

  try {
    checkWindows = await checkWindowService.getCheckWindowsAssignedToForms([formId])
  } catch (error) {
    // WARN how would this ever be shown????
    req.flash(`Unable to find check window(s) for active check form: ${error.message}`)
    return res.redirect('/test-developer/upload-and-view-forms')
  }
  if (checkWindows && checkWindows.length > 0) {
    formData.checkWindowNames = checkFormService.checkWindowNames(checkWindows)
    formData.canDelete = checkFormService.canDelete(checkWindows)
  }
  res.locals.pageTitle = formData && formData.name
  req.breadcrumbs(res.locals.pageTitle)
  res.render('test-developer/view-check-form', {
    form: formData,
    num: 1,
    breadcrumbs: req.breadcrumbs()
  })
}

/**
 * Initial page with form to assign check forms to check windows.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const assignCheckFormsToWindowsPage = async (req, res, next) => {
  res.locals.pageTitle = 'Assign forms to check windows'

  let checkWindowsData
  let totalFormsAvailable

  totalFormsAvailable = await checkFormService.getUnassignedFormsForCheckWindow(req.params.checkWindowId)
  if (totalFormsAvailable) {
    totalFormsAvailable = totalFormsAvailable.length
  }

  try {
    checkWindowsData = await checkWindowService.getFutureCheckWindowsAndCountForms()
  } catch (error) {
    return next(error)
  }

  req.breadcrumbs(res.locals.pageTitle)
  res.render('test-developer/assign-check-forms-to-windows', {
    checkWindowsData: checkWindowsData,
    totalFormsAvailable,
    breadcrumbs: req.breadcrumbs()
  })
}

/**
 * Assign check forms to check window.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
const assignCheckFormToWindowPage = async (req, res, next) => {
  const checkWindowId = req.params.checkWindowId
  res.locals.pageTitle = 'Assign forms'

  let checkFormsList
  let checkWindow

  try {
    checkWindow = await checkWindowDataService.sqlFindOneById(checkWindowId)
  } catch (error) {
    return next(error)
  }

  if (moment().isBefore(checkWindow.checkStartDate)) {
    try {
      checkFormsList = await checkFormService.getUnassignedFormsForCheckWindow(checkWindow.id)
    } catch (error) {
      return next(error)
    }
  } else {
    checkFormsList = []
  }

  req.breadcrumbs('Assign forms to check windows', '/test-developer/assign-form-to-window')
  req.breadcrumbs(res.locals.pageTitle)
  res.render('test-developer/assign-forms', {
    checkWindowId: checkWindow.id,
    checkWindowName: checkWindow.name,
    checkFormsList,
    breadcrumbs: req.breadcrumbs()
  })
}

/**
 * Save assigned check forms to check window.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
const saveAssignCheckFormsToWindow = async (req, res, next) => {
  let postedFormIds

  // fix for non-array scenarios
  if (typeof req.body.checkForm === 'object') {
    if (Array.isArray(req.body.checkForm)) {
      postedFormIds = req.body.checkForm
    } else {
      postedFormIds = Object.values(req.body.checkForm)
    }
  } else if (typeof req.body.checkForm === 'string') {
    postedFormIds = [req.body.checkForm]
  }
  // end fix
  const totalForms = Object.values(postedFormIds).length
  const checkWindowName = req.body.checkWindowName || 'N/A'

  // Validate again that at least one check form has been ticked
  if (totalForms < 1) {
    req.flash('error', 'Select at least one form')
    return res.redirect('/test-developer/assign-form-to-window')
  }

  if (!req.body.checkWindowId) {
    req.flash('error', 'Missing check window id')
    return res.redirect('/test-developer/assign-form-to-window')
  }

  const checkWindowId = req.body.checkWindowId

  try {
    await checkWindowService.assignFormsToWindow(checkWindowId, postedFormIds)
  } catch (error) {
    return next(error)
  }

  req.flash('info', `${totalForms} ${totalForms === 1 ? 'form has' : 'forms have'} been assigned to ${checkWindowName}`)
  req.flash('checkWindowId', checkWindowId)
  res.redirect('/test-developer/assign-form-to-window')
}

/**
 * Render page to unassign check forms from check windows.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const unassignCheckFormsFromWindowPage = async (req, res, next) => {
  if (!req.params.checkWindowId) {
    req.flash('error', 'Missing check window id')
    return res.redirect('/test-developer/assign-form-to-window')
  }

  const checkWindowId = req.params.checkWindowId
  let checkFormsList
  let checkWindow

  try {
    checkWindow = await checkWindowDataService.sqlFindOneById(checkWindowId)
    if (!checkWindow) {
      req.flash('error', 'check window not found')
      return res.redirect('/test-developer/assign-form-to-window')
    }
    checkFormsList = await checkFormService.getAssignedFormsForCheckWindow(checkWindow.id)
    res.locals.pageTitle = checkWindow.name
    req.breadcrumbs('Assign forms to check windows', '/test-developer/assign-form-to-window')
    req.breadcrumbs(res.locals.pageTitle)
    res.render('test-developer/unassign-check-forms', {
      checkWindowId: checkWindow.id,
      checkWindowName: checkWindow.name,
      checkFormsList,
      breadcrumbs: req.breadcrumbs()
    })
  } catch (error) {
    return next(error)
  }
}

/**
 * Unassign form from selected check window.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const unassignCheckFormFromWindow = async (req, res, next) => {
  if (!req.body.checkWindowId) {
    req.flash('error', 'Missing check window id')
    return res.redirect('/test-developer/assign-form-to-window')
  }

  if (!req.body.checkFormId) {
    req.flash('error', 'Missing check form id')
    return res.redirect(`/test-developer/unassign-forms/${req.body.checkWindowId}`)
  }

  const checkFormId = req.body.checkFormId
  const checkWindowId = req.body.checkWindowId

  try {
    await checkFormService.removeWindowAssignment(checkFormId, checkWindowId)
  } catch (error) {
    req.flash('error', 'Failed to unassign form')
    res.redirect(`/test-developer/unassign-forms/${checkWindowId}`)
    return next(error)
  }

  req.flash('info', 'Form unassigned successfully')
  res.redirect('/test-developer/assign-form-to-window')
}

/**
 * Download pupil check data view.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
const getDownloadPupilCheckData = async (req, res, next) => {
  res.locals.pageTitle = 'Download pupil check data'
  req.breadcrumbs(res.locals.pageTitle)

  let psychometricianReport
  try {
    psychometricianReport = await testDeveloperReportService.getReportMeta()
  } catch (error) {
    return next(error)
  }

  if (psychometricianReport) {
    psychometricianReport.fileName = psychometricianReport.fileName.replace(/\.zip$/, '')
    psychometricianReport.dateGenerated = dateService.formatDateAndTime(psychometricianReport.createdAt.tz(config.DEFAULT_TIMEZONE))
  }

  res.render('test-developer/download-pupil-check-data', {
    breadcrumbs: req.breadcrumbs(),
    psychometricianReport
  })
}

/**
 * Download pupil check data ZIP file.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
const getFileDownloadPupilCheckData = async (req, res, next) => {
  let psychometricianReport
  try {
    psychometricianReport = await testDeveloperReportService.getReportMeta(req.params.urlSlug)
    if (!psychometricianReport) {
      return res.redirect('/test-developer/download-pupil-check-data')
    }
  } catch (error) {
    req.flash('error', error.message)
    return res.redirect('/test-developer/download-pupil-check-data')
  }

  try {
    res.setHeader('Content-type', 'application/zip')
    const fileName = `pupil-check-data-${dateService.formatFileName(psychometricianReport.createdAt)}.zip`
    res.setHeader('Content-disposition', `attachment; filename="${fileName}"`)
    await testDeveloperReportService.downloadFile(psychometricianReport.container, psychometricianReport.fileName, res)
  } catch (error) {
    logger.error(error)
    return next(error)
  }
}

module.exports = {
  getDownloadPupilCheckData,
  getFileDownloadPupilCheckData,
  getTestDeveloperHomePage,
  uploadAndViewFormsPage,
  removeCheckForm,
  uploadCheckForm,
  displayCheckForm,
  assignCheckFormsToWindowsPage,
  assignCheckFormToWindowPage,
  saveAssignCheckFormsToWindow,
  unassignCheckFormsFromWindowPage,
  unassignCheckFormFromWindow
}
