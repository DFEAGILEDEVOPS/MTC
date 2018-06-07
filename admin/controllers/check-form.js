'use strict'

const path = require('path')
const fs = require('fs-extra')
const checkFormService = require('../services/check-form.service')
const checkProcessingService = require('../services/check-processing.service')
const checkWindowService = require('../services/check-window.service')
const checkWindowDataService = require('../services/data-access/check-window.data.service')
const dateService = require('../services/date.service')
const sortingAttributesService = require('../services/sorting-attributes.service')
const psychometricianReportService = require('../services/psychometrician-report.service')
const winston = require('winston')

/**
 * Display landing page for 'test developer' role.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
const getTestDeveloperHomePage = async (req, res, next) => {
  res.locals.pageTitle = 'MTC for test development'
  try {
    req.breadcrumbs(res.locals.pageTitle)
    res.render('test-developer/test-developer-home', {
      breadcrumbs: ''
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

  try {
    let formData

    // Sorting
    const sortingOptions = [
      { key: 'name', value: 'asc' },
      { key: 'window', value: 'asc' }
    ]
    const sortField = req.params.sortField === undefined ? 'name' : req.params.sortField
    const sortDirection = req.params.sortDirection === undefined ? 'asc' : req.params.sortDirection
    const { htmlSortDirection, arrowSortDirection } = sortingAttributesService.getAttributes(sortingOptions, sortField, sortDirection)

    formData = await checkFormService.formatCheckFormsAndWindows(sortField, sortDirection)

    return res.render('test-developer/upload-and-view-forms', {
      forms: formData,
      htmlSortDirection,
      arrowSortDirection,
      breadcrumbs: req.breadcrumbs()
    })
  } catch (error) {
    return next(error)
  }
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
 * Save check form (POST).
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
const saveCheckForm = async (req, res, next) => {
  res.locals.pageTitle = 'Upload check form'
  req.breadcrumbs('Upload and view forms', '/test-developer/upload-and-view-forms')
  req.breadcrumbs(res.locals.pageTitle)

  let uploadError = {}
  let uploadFile = req.files.csvFile
  let checkForm = {}
  let absFile
  let deleteDir
  let fileName

  // Various errors cause a page to be rendered instead, and it *needs* a title
  if (!(uploadFile && path.extname(uploadFile.filename.toLowerCase()) === '.csv')) {
    // Either it actually wasn't uploaded, or it failed one the busboy checks: e.g.
    // * mime-type needs to be text/csv (.csv)
    // * uploaded from the wrong path
    // * file size exceeded?
    uploadError.message = 'A valid CSV file was not uploaded'
    uploadError.errors = {}
    uploadError.errors['csvFile'] = new Error(uploadError.message)

    return res.render('test-developer/upload-new-form', {
      error: uploadError,
      breadcrumbs: req.breadcrumbs()
    })
  }

  /**
   * uploadfile is an object:
   *
   { uuid: 'ff6c17d9-84d0-4a9b-a3c4-3f94a6ccdc40',
     field: 'uploadFile',
     file: 'data/files/ff6c17d9-84d0-4a9b-a3c4-3f94a6ccdc40/uploadFile/form-1.csv',
     filename: 'form-1.csv',
     encoding: '7bit',
     mimetype: 'text/csv',
     truncated: false,
     done: true } }
   */

  absFile = path.join(__dirname, '/../', uploadFile.file)
  deleteDir = path.dirname(path.dirname(absFile))

  try {
    await checkFormService.populateFromFile(checkForm, absFile)
  } catch (error) {
    fs.remove(deleteDir, err => {
      if (err) winston.error(err.message)
    })
    return res.render('test-developer/upload-new-form', {
      error: new Error('There is a problem with the form content'),
      breadcrumbs: req.breadcrumbs()
    })
  }

  try {
    fileName = await checkFormService.buildFormName(uploadFile.filename)
    if (!fileName) {
      req.flash('error', `Select a file with no more than 128 characters in name`)
      return res.redirect('/test-developer/upload-new-form')
    }
  } catch (error) {
    return next(new Error(`File name should be between 1 and 128 characters - ${uploadFile.filename.slice(0, -4)}`))
  }

  try {
    const isFileNameValid = await checkFormService.validateCheckFormName(fileName)
    if (!isFileNameValid) {
      req.flash('error', `'${fileName}' already exists. Rename and upload again.`)
      return res.redirect('/test-developer/upload-new-form')
    }
    checkForm.name = fileName
  } catch (error) {
    return next(new Error(`Error trying to find form with name ${uploadFile.filename.slice(0, -4)}`))
  }

  fs.remove(deleteDir, err => {
    if (err) winston.error(err.message)
  })

  try {
    await checkFormService.create(checkForm)
    req.flash('info', 'New form uploaded')
    req.flash('formName', checkForm.name)
  } catch (error) {
    return next(error)
  }

  res.redirect('/test-developer/upload-and-view-forms')
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
    checkWindowsData = await checkWindowService.getCurrentCheckWindowsAndCountForms()
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

  try {
    checkFormsList = await checkFormService.getUnassignedFormsForCheckWindow(checkWindow.id)
  } catch (error) {
    return next(error)
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
    postedFormIds = [ req.body.checkForm ]
  }
  // end fix
  const totalForms = Object.values(postedFormIds).length
  const checkWindowName = req.body.checkWindowName || 'N/A'

  // Validate again that at least one check form has been ticked
  if (totalForms < 1) {
    req.flash('error', `Select at least one form`)
    return res.redirect('/test-developer/assign-form-to-window')
  }

  if (!req.body.checkWindowId) {
    req.flash('error', `Missing check window id`)
    return res.redirect('/test-developer/assign-form-to-window')
  }

  let checkWindowId = req.body.checkWindowId

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
    req.flash('error', `Missing check window id`)
    return res.redirect('/test-developer/assign-form-to-window')
  }

  let checkWindowId = req.params.checkWindowId
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
    req.flash('error', `Missing check window id`)
    return res.redirect('/test-developer/assign-form-to-window')
  }

  if (!req.body.checkFormId) {
    req.flash('error', `Missing check form id`)
    return res.redirect(`/test-developer/unassign-forms/${req.body.checkWindowId}`)
  }

  const checkFormId = req.body.checkFormId
  const checkWindowId = req.body.checkWindowId

  try {
    await checkFormService.removeWindowAssignment(checkFormId, checkWindowId)
  } catch (error) {
    req.flash('error', `Failed to unassign form`)
    res.redirect(`/test-developer/unassign-forms/${checkWindowId}`)
    return next(error)
  }

  req.flash('info', `Form unassigned successfully`)
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
    psychometricianReport = await psychometricianReportService.getUploadedFile()
  } catch (error) {
    return next(error)
  }

  if (psychometricianReport) {
    psychometricianReport.csvName = psychometricianReport.csvName.replace(/\.csv$/, '')
    psychometricianReport.dateGenerated = dateService.formatDateAndTime(psychometricianReport.dateGenerated)
  }

  res.render('test-developer/download-pupil-check-data', {
    breadcrumbs: req.breadcrumbs(),
    psychometricianReport
  })
}

/**
 * Download pupil check data CSV file.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
const getCsvDownloadPupilCheckData = async (req, res, next) => {
  let psychometricianReport, reportContent
  try {
    psychometricianReport = await psychometricianReportService.getUploadedFile()
    if (!psychometricianReport) {
      return res.redirect('/test-developer/download-pupil-check-data')
    }
    reportContent = await psychometricianReportService.downloadUploadedFile(psychometricianReport.remoteFilename)
  } catch (error) {
    req.flash('error', error.message)
    return res.redirect('/test-developer/download-pupil-check-data')
  }

  res.setHeader('Content-type', 'text/csv')
  res.setHeader('Content-disposition', `attachment; filename=${psychometricianReport.csvName}`)

  res.send(reportContent)
}

/**
 * Generate latest pupil check data.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
const getGenerateLatestPupilCheckData = async (req, res, next) => {
  try {
    await checkProcessingService.process()

    const reportStream = await psychometricianReportService.generateReport()
    const blobResult = await psychometricianReportService.uploadToBlobStorage(reportStream)

    let { csvName, dateGenerated } = await psychometricianReportService.create(blobResult)

    csvName = csvName.replace(/\.csv$/, '')
    dateGenerated = dateService.formatDateAndTime(dateGenerated)

    return res.status(200).json({ csvName, dateGenerated })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

module.exports = {
  getDownloadPupilCheckData,
  getCsvDownloadPupilCheckData,
  getGenerateLatestPupilCheckData,
  getTestDeveloperHomePage,
  uploadAndViewFormsPage,
  removeCheckForm,
  uploadCheckForm,
  saveCheckForm,
  displayCheckForm,
  assignCheckFormsToWindowsPage,
  assignCheckFormToWindowPage,
  saveAssignCheckFormsToWindow,
  unassignCheckFormsFromWindowPage,
  unassignCheckFormFromWindow
}
