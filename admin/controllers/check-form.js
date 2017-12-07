'use strict'

const path = require('path')
const fs = require('fs-extra')
const checkFormService = require('../services/check-form.service')
const checkFormDataService = require('../services/data-access/check-form.data.service')
const checkWindowService = require('../services/check-window.service')
const checkWindowDataService = require('../services/data-access/check-window.data.service')
const sortingAttributesService = require('../services/sorting-attributes.service')

/**
 * Display landing page for 'test developer' role.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
const getTestDeveloperHome = async (req, res, next) => {
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
const uploadAndViewForms = async (req, res, next) => {
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
    const checkForm = await checkFormDataService.getActiveForm(id)
    if (!checkForm) {
      return next(new Error(`Unable to find check form with id [${id}]`))
    }

    // Un-assign check-form from any check-windows
    const CheckWindowsByForm = await checkWindowService.getCheckWindowsAssignedToForms()
    await checkFormService.unassignedCheckFormsFromCheckWindows(checkForm, CheckWindowsByForm)
    await checkWindowService.markAsDeleted(checkForm)
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
  if (!uploadFile) {
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
      if (err) console.error(err)
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
      req.flash('error', `${fileName} already exists. Rename and upload again.`)
      return res.redirect('/test-developer/upload-new-form')
    }
    checkForm.name = fileName
  } catch (error) {
    return next(new Error(`Error trying to find form with name ${uploadFile.filename.slice(0, -4)}`))
  }

  fs.remove(deleteDir, err => {
    if (err) console.error(err)
  })

  try {
    const newForm = await checkFormDataService.create(checkForm)
    req.flash('info', 'New form uploaded')
    req.flash('formName', newForm.name)
  } catch (error) {
    return next(error)
  }

  res.redirect('/test-developer/upload-and-view-forms')
}

const displayCheckForm = async (req, res, next) => {
  req.breadcrumbs('Upload and view forms', '/test-developer/upload-and-view-forms')
  res.locals.pageTitle = 'View form'

  let formData
  let checkWindows

  try {
    formData = await checkFormDataService.getActiveFormPlain(req.params.formId)
    formData.checkWindowsName = []
    formData.canDelete = true
  } catch (error) {
    req.flash('error', `Unable to find check form details for form id ${req.params.formId}`)
    return res.redirect('/test-developer/upload-and-view-forms')
  }

  try {
    checkWindows = await checkWindowService.getCheckWindowsAssignedToForms()
  } catch (error) {
    console.log(`Unable to find check window(s) for active check form: ${error.message}`)
  }

  if (checkWindows[req.params.formId]) {
    formData.checkWindowNames = checkFormService.checkWindowNames(checkWindows[req.params.formId])
    formData.canDelete = checkFormService.canDelete(checkWindows[req.params.formId])
  }

  req.breadcrumbs(res.locals.pageTitle)
  res.render('test-developer/view-check-form', {
    form: formData,
    num: 1,
    breadcrumbs: req.breadcrumbs()
  })
}

const assignCheckFormsToWindows = async (req, res, next) => {
  res.locals.pageTitle = 'Assign forms to check windows'

  let checkWindowsData

  try {
    checkWindowsData = await checkWindowService.getCurrentCheckWindowsAndCountForms()
  } catch (error) {
    console.log('getCurrentCheckWindowsAndCountForms FAILED', error)
    return next(error)
  }

  req.breadcrumbs(res.locals.pageTitle)
  res.render('test-developer/assign-check-forms-to-windows', {
    checkWindowsData: checkWindowsData,
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
const assignCheckFormToWindow = async (req, res, next) => {
  const checkWindowId = req.params.checkWindowId
  res.locals.pageTitle = 'Assign forms'

  let checkFormsList
  let checkWindow

  try {
    checkWindow = await checkWindowDataService.fetchCheckWindow(checkWindowId)
  } catch (error) {
    return next(error)
  }

  try {
    checkFormsList = await checkFormService.getUnassignedFormsForCheckWindow(checkWindow.forms)
  } catch (error) {
    return next(error)
  }

  req.breadcrumbs('Assign forms to check windows', '/test-developer/assign-form-to-window')
  req.breadcrumbs(res.locals.pageTitle)
  res.render('test-developer/assign-forms', {
    checkWindowId: checkWindowId,
    checkWindowName: checkWindow.checkWindowName,
    checkFormsList,
    breadcrumbs: req.breadcrumbs()
  })
}

/**
 * @TODO: WIP.
 * Save assigned check forms to check window.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
const saveAssignCheckFormsToWindow = async (req, res, next) => {
  const postedForms = req.body.checkForm
  const totalForms = Object.values(postedForms).length
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
  let checkWindow

  try {
    checkWindow = await checkWindowDataService.fetchCheckWindow(checkWindowId)
  } catch (error) {
    return next(error)
  }

  try {
    checkWindow.forms = checkWindowService.mergedFormIds(checkWindow.forms, Object.values(req.body.checkForm))
    await checkWindowDataService.create(checkWindow)
  } catch (error) {
    return next(error)
  }

  req.flash('info', `${totalForms} forms have been assigned to ${checkWindowName}`)
  res.redirect('/test-developer/assign-form-to-window')
}

// @TODO: WIP.
const unassignCheckFormsFromWindow = async (req, res, next) => {
  res.redirect('/test-developer/assign-form-to-window')
}

module.exports = {
  getTestDeveloperHome,
  uploadAndViewForms,
  removeCheckForm,
  uploadCheckForm,
  saveCheckForm,
  displayCheckForm,
  assignCheckFormsToWindows,
  assignCheckFormToWindow,
  saveAssignCheckFormsToWindow,
  unassignCheckFormsFromWindow
}
