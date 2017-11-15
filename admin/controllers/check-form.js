const path = require('path')
const fs = require('fs-extra')
const CheckForm = require('../models/check-form')
const checkFormService = require('../services/check-form.service')
const checkFormDataService = require('../services/data-access/check-form.data.service')
const checkWindowService = require('../services/check-window.service')

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
      breadcrumbs: req.breadcrumbs()
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
  try {
    const forms = await checkFormDataService.getActiveForms().sort({createdAt: -1}).exec()
    let formData = forms.map(e => { return e.toJSON() })
    const checkWindows = await checkWindowService.getCheckWindowsAssignedToForms()

    formData.forEach(f => {
      if (checkWindows[f._id]) {
        f.checkWindows = checkWindows[f._id].map(cw => { return cw.toJSON() })
      } else {
        f.checkWindows = []
      }
    })

    req.breadcrumbs(res.locals.pageTitle)
    return res.render('test-developer/upload-and-view-forms', {
      forms: formData,
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
    const CheckWindow = await checkFormDataService.getActiveForm(id).exec()
    if (!CheckWindow) {
      return next(new Error(`Unable to find form.id [${id}]`))
    }
    // Un-assign check-form from any check-windows
    const checkWindowsByForm = await checkWindowService.getCheckWindowsAssignedToForms()
    if (checkWindowsByForm[CheckWindow._id]) {
      // Array of CheckWindows models, each with a forms array
      let modifiedCheckWindows = []
      checkWindowsByForm[CheckWindow._id].forEach(cw => {
        const index = cw.forms.indexOf(CheckWindow._id)
        if (index > -1) {
          cw.forms.splice(index, 1)
          modifiedCheckWindows.push(cw)
        }
      })
      // Update any changed check windows
      const promises = modifiedCheckWindows.map(cw => { cw.save() })
      await Promise.all(promises)
    }
    await checkWindowService.markAsDeleted(CheckWindow)
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
  try {
    req.breadcrumbs(res.locals.pageTitle)
    res.render('test-developer/upload-new-form', {
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
  let uploadError = {}
  let uploadFile = req.files.csvFile
  let checkForm = new CheckForm()
  let absFile
  let deleteDir
  let forms
  let formData

  // Various errors cause a page to be rendered instead, and it *needs* a title
  res.locals.pageTitle = 'Upload check form'
  req.breadcrumbs(res.locals.pageTitle)

  // Pick up the list of forms in case we have an error and need to re-render the page
  try {
    forms = await checkFormDataService.getActiveForms().sort({createdAt: -1}).exec()
    formData = forms.map(e => { return e.toJSON() })
    const checkWindows = await checkWindowService.getCheckWindowsAssignedToForms()
    formData.forEach(f => {
      if (checkWindows[f._id]) {
        // this form is assigned to some check windows
        f.checkWindows = checkWindows[f._id].map(cw => {
          return cw.toJSON()
        })
      } else {
        f.checkWindows = []
      }
    })
  } catch (error) {
    return next(error)
  }

  if (!uploadFile) {
    // Either it actually wasn't uploaded, or it failed one the busboy checks: e.g.
    // * mimetype needs to be text/csv (.csv)
    // * uploaded from the wrong path
    // * file size exceeded?
    uploadError.message = 'A valid CSV file was not uploaded'
    uploadError.errors = {}
    uploadError.errors['csvFile'] = new Error(uploadError.message)

    return res.render('test-developer/upload-and-view-forms', {
      forms: formData,
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
    // Remove the uploaded file
    fs.remove(deleteDir, err => {
      if (err) console.error(err)
    })
    return res.render('test-developer/upload-and-view-forms', {
      forms: formData,
      error: new Error('There is a problem with the form content'),
      breadcrumbs: req.breadcrumbs()
    })
  }

  // Remove the uploaded file
  fs.remove(deleteDir, err => {
    if (err) console.error(err)
  })

  try {
    await checkForm.validate()
  } catch (error) {
    return res.render('test-developer/upload-and-view-forms', {
      forms: formData,
      error: new Error('There is a problem with the form content'),
      breadcrumbs: req.breadcrumbs()
    })
  }

  try {
    await checkForm.save()
  } catch (error) {
    return next(error)
  }

  res.redirect('/test-developer/upload-and-view-forms')
}

const displayCheckForm = async (req, res, next) => {
  req.breadcrumbs('Upload and view forms', '/test-developer/upload-and-view-forms')
  res.locals.pageTitle = 'View form'
  let formData
  let canDelete = true

  try {
    const checkWin = await checkFormDataService.getActiveForm(req.params.formId).exec()
    formData = checkWin.toJSON()
    formData.checkWindows = []
    const checkWindows = await checkWindowService.getCheckWindowsAssignedToForms()

    if (checkWindows[checkWin.id]) {
      // Form is assigned to one or more check windows
      formData.checkWindows = checkWindows[checkWin.id].map(cw => { return cw.toJSON() })
      formData.checkWindows.forEach(cw => {
        if (cw.startDate <= Date.now()) {
          // we can't delete a form whose check window has started.
          canDelete = false
        }
      })
    } else {
      formData.checkWindows = []
    }

    req.breadcrumbs(res.locals.pageTitle)
    res.render('test-developer/view-check-form', {
      form: formData,
      canDelete: canDelete,
      breadcrumbs: req.breadcrumbs()
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getTestDeveloperHome,
  uploadAndViewForms,
  removeCheckForm,
  uploadCheckForm,
  saveCheckForm,
  displayCheckForm
}
