'use strict'

const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs-extra')
const CheckForm = require('../models/check-form')
const CheckWindow = require('../models/check-window')
const checkFormService = require('../services/check-form.service')
const isAuthenticated = require('../authentication/middleware')
const rolesConfig = require('../roles-config')
const testDeveloperController = require('../controllers/test-developer')

router.get('/', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => testDeveloperController.getTestDeveloperHome(req, res, next))
router.get('/home', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => testDeveloperController.getTestDeveloperHome(req, res, next))
router.get('/upload-and-view-forms', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => testDeveloperController.uploadAndViewForms(req, res, next))
router.get('/upload-check-form', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => testDeveloperController.uploadCheckForm(req, res, next))
router.get('/delete-form/:formId', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => testDeveloperController.removeCheckForm(req, res, next))

/* @TODO: The code below is meant to be refactored */
/* GET manage check forms page. */

/* POST the new questions for the form */
router.post('/upload-and-view-forms', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), async function (req, res, next) {
  let uploadError = {}
  let uploadFile = req.files.csvFile
  let checkForm = new CheckForm()
  let absFile
  let deleteDir
  let forms
  let formData

  // Various errors cause a page to be rendered instead, and it *needs* a title
  res.locals.pageTitle = 'Create check forms'
  req.breadcrumbs(res.locals.pageTitle)

  // Pick up the list of forms in case we have an error and need to re-render the page
  try {
    forms = await CheckForm.getActiveForms().sort({createdAt: -1}).exec()
    formData = forms.map(e => { return e.toJSON() })

    const checkWindows = await CheckWindow.getCheckWindowsAssignedToForms()
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
    console.error(error)
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
    console.error(error)
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

  // Form saved successfully
  res.redirect('/test-developer/upload-and-view-forms')
})

/* GET - choose the check window page */
router.get('/choose-check-window', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), async function (req, res, next) {
  res.locals.pageTitle = 'Choose check window'
  // the formIds to assign are passed in the query string
  let formIds = []
  let forms
  let formData
  let checkWindows
  let checkWindowData

  if (Array.isArray(req.query['check-form'])) {
    formIds = req.query['check-form']
  } else {
    if (req.query['check-form']) {
      formIds.push(req.query['check-form'])
    } else {
      console.error(new Error('No formIds selected'))
      return res.redirect('upload-and-view-forms')
    }
  }

  try {
    forms = await CheckForm.getActiveForms({_id: formIds}).sort({_id: 1}).exec()
    formData = forms.map(e => { return e.toJSON() })
  } catch (error) {
    return next(error)
  }

  try {
    checkWindows = await CheckWindow.find({}).sort({startDate: 1}).exec()
    checkWindowData = checkWindows.map(e => { return e.toJSON() })
  } catch (error) {
    return next(error)
  }

  req.breadcrumbs(res.locals.pageTitle)
  res.render('test-developer/choose-check-window', {
    forms: formData,
    checkWindows: checkWindowData,
    breadcrumbs: req.breadcrumbs()
  })
})

/* GET - view a form */
router.get('/view-form/:id', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), async function (req, res, next) {
  res.locals.pageTitle = 'View form'
  let formData
  let canDelete = true

  try {
    const form = await CheckForm.getActiveForm(req.params.id).exec()
    formData = form.toJSON()
    formData.checkWindows = []
    const checkWindows = await CheckWindow.getCheckWindowsAssignedToForms()

    if (checkWindows[form.id]) {
      // this form is assigned to one or more check windows
      formData.checkWindows = checkWindows[form.id].map(cw => { return cw.toJSON() })
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
    res.render('test-developer/view-form', {
      form: formData,
      canDelete: canDelete,
      breadcrumbs: req.breadcrumbs()
    })
  } catch (error) {
    next(error)
  }
})

/** Assign forms to check windows */
router.post('/assign-forms-to-check-windows', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), async function (req, res, next) {
  const formIds = req.body['check-form'] // could be scalar
  const checkWindowIds = req.body['check-window'] // could be scalar
  let checkWindows
  let forms

  // fetch the forms and checkwindows
  try {
    forms = await CheckForm.getActiveForms({_id: formIds}).exec()
    checkWindows = await CheckWindow.find({_id: checkWindowIds})
  } catch (error) {
    return next(error)
  }

  checkWindows.forEach(cw => {
    forms.forEach(f => {
      // Check this form is not already assigned to this checkWindow
      if (cw.forms.indexOf(f._id) === -1) {
        cw.forms.push(f._id)
      }
    })
  })

  try {
    const promises = checkWindows.map(cw => { cw.save() })
    await Promise.all(promises)
  } catch (error) {
    return next(error)
  }

  res.redirect('upload-and-view-forms')
})

module.exports = router
