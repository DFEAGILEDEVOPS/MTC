'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const rolesConfig = require('../roles-config')
const checkFormController = require('../controllers/check-form')

router.get('/', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.getTestDeveloperHome(req, res, next))
router.get('/home', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.getTestDeveloperHome(req, res, next))
router.get('/upload-and-view-forms/:sortField/:sortDirection', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.uploadAndViewForms(req, res, next))
router.get('/upload-and-view-forms', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.uploadAndViewForms(req, res, next))
router.get('/view-form/:formId', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.displayCheckForm(req, res, next))
router.get('/delete-form/:formId', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.removeCheckForm(req, res, next))
router.get('/upload-new-form', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.uploadCheckForm(req, res, next))
router.post('/upload-new-form', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.saveCheckForm(req, res, next))
router.get('/assign-form-to-window', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.assignCheckFormsToWindows(req, res, next))
router.get('/assign-form-to-window/:checkWindowId', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.assignCheckFormToWindow(req, res, next))
router.post('/assign-form-to-window', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.saveAssignCheckFormsToWindow(req, res, next))
router.get('/unassign-forms/:checkWindowId', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.unassignCheckFormsFromWindow(req, res, next))

/* @TODO: The code below will be refactored in the next PR (PBI 17403) */
/* GET - choose the check window page */
// router.get('/choose-check-window', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), async function (req, res, next) {
//   res.locals.pageTitle = 'Choose check window'
//
//   // the formIds to assign are passed in the query string
//   let formIds = []
//   let forms
//   let formData
//   let checkWindows
//   let checkWindowData
//
//   if (Array.isArray(req.query['check-form'])) {
//     formIds = req.query['check-form']
//   } else {
//     if (req.query['check-form']) {
//       formIds.push(req.query['check-form'])
//     } else {
//       console.error(new Error('No formIds selected'))
//       return res.redirect('upload-and-view-forms')
//     }
//   }
//
//   try {
//     forms = await checkFormService.fetchSortedActiveForms({_id: formIds}, '_id', 'asc')
//     formData = forms.map(e => { return e.toJSON() })
//   } catch (error) {
//     console.log('fetchSortedActiveForms FAILES')
//     //return next(error)
//   }
//
//   try {
//     checkWindows = await CheckWindow.find({}).sort({startDate: 1}).exec()
//     checkWindowData = checkWindows.map(e => { return e.toJSON() })
//   } catch (error) {
//     console.log('CANT FIND WINDOWS')
//     //return next(error)
//   }
//
//   req.breadcrumbs(res.locals.pageTitle)
//   res.render('test-developer/choose-check-window', {
//     forms: formData,
//     checkWindows: checkWindowData,
//     breadcrumbs: req.breadcrumbs()
//   })
// })
//
// /** Assign forms to check windows */
// router.post('/assign-forms-to-check-windows', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), async function (req, res, next) {
//   const formIds = req.body['check-form'] // could be scalar
//   const checkWindowIds = req.body['check-window'] // could be scalar
//   let checkWindows
//   let forms
//
//   try {
//     forms = await checkFormService.fetchSortedActiveForms({_id: formIds})
//     checkWindows = await CheckWindow.find({_id: checkWindowIds})
//   } catch (error) {
//     return next(error)
//   }
//
//   checkWindows.forEach(cw => {
//     forms.forEach(f => {
//       // Check this form is not already assigned to this checkWindow
//       if (cw.forms.indexOf(f._id) === -1) {
//         cw.forms.push(f._id)
//       }
//     })
//   })
//
//   try {
//     const promises = checkWindows.map(cw => { cw.save() })
//     await Promise.all(promises)
//   } catch (error) {
//     return next(error)
//   }
//
//   res.redirect('upload-and-view-forms')
// })

module.exports = router
