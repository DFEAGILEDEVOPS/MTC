'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const roles = require('../lib/consts/roles')
const checkFormController = require('../controllers/check-form')
const payloadController = require('../controllers/pupil-payload-viewer')

router.get('/', isAuthenticated(roles.testDeveloper), (req, res, next) => checkFormController.getTestDeveloperHomePage(req, res, next))
router.get('/home', isAuthenticated(roles.testDeveloper), (req, res, next) => checkFormController.getTestDeveloperHomePage(req, res, next))
router.get('/upload-and-view-forms', isAuthenticated(roles.testDeveloper), (req, res, next) => checkFormController.uploadAndViewFormsPage(req, res, next))
router.get('/view-form/:formId', isAuthenticated(roles.testDeveloper), (req, res, next) => checkFormController.displayCheckForm(req, res, next))
router.get('/delete-form/:formId', isAuthenticated(roles.testDeveloper), (req, res, next) => checkFormController.removeCheckForm(req, res, next))
router.get('/upload-new-form', isAuthenticated(roles.testDeveloper), (req, res, next) => checkFormController.uploadCheckForm(req, res, next))
router.post('/upload-new-form', isAuthenticated(roles.testDeveloper), (req, res, next) => checkFormController.saveCheckForm(req, res, next))
router.get('/assign-form-to-window', isAuthenticated(roles.testDeveloper), (req, res, next) => checkFormController.assignCheckFormsToWindowsPage(req, res, next))
router.get('/assign-form-to-window/:checkWindowId', isAuthenticated(roles.testDeveloper), (req, res, next) => checkFormController.assignCheckFormToWindowPage(req, res, next))
router.post('/assign-form-to-window', isAuthenticated(roles.testDeveloper), (req, res, next) => checkFormController.saveAssignCheckFormsToWindow(req, res, next))
router.get('/unassign-forms/:checkWindowId', isAuthenticated(roles.testDeveloper), (req, res, next) => checkFormController.unassignCheckFormsFromWindowPage(req, res, next))
router.post('/unassign-form', isAuthenticated(roles.testDeveloper), (req, res, next) => checkFormController.unassignCheckFormFromWindow(req, res, next))
router.get('/download-pupil-check-data', isAuthenticated(roles.testDeveloper), (req, res, next) => checkFormController.getDownloadPupilCheckData(req, res, next))
router.get('/file-download-pupil-check-data/:urlSlug', isAuthenticated(roles.testDeveloper), (req, res, next) => checkFormController.getFileDownloadPupilCheckData(req, res, next))
router.get('/view-pupil-payload', isAuthenticated(roles.testDeveloper), (req, res, next) => payloadController.getViewPayloadForm(req, res, next))
router.get('/raw-pupil-payload', isAuthenticated(roles.testDeveloper), (req, res, next) => payloadController.rawPupilPayload(req, res, next))

module.exports = router
