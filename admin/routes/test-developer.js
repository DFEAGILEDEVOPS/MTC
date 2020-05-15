'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const roles = require('../lib/consts/roles')
const testDeveloperController = require('../controllers/test-developer')
const testDeveloper2Controller = require('../controllers/test-developer2')
const payloadController = require('../controllers/pupil-payload-viewer')

router.get('/', isAuthenticated(roles.testDeveloper), (req, res, next) => testDeveloperController.getTestDeveloperHomePage(req, res, next))
router.get('/home', isAuthenticated(roles.testDeveloper), (req, res, next) => testDeveloperController.getTestDeveloperHomePage(req, res, next))
router.get('/download-pupil-check-data', isAuthenticated(roles.testDeveloper), (req, res, next) => testDeveloperController.getDownloadPupilCheckData(req, res, next))
router.get('/file-download-pupil-check-data/:urlSlug', isAuthenticated(roles.testDeveloper), (req, res, next) => testDeveloperController.getFileDownloadPupilCheckData(req, res, next))
router.get('/view-pupil-payload', isAuthenticated(roles.testDeveloper), (req, res, next) => payloadController.getViewPayloadForm(req, res, next))
router.get('/raw-pupil-payload', isAuthenticated(roles.testDeveloper), (req, res, next) => payloadController.rawPupilPayload(req, res, next))
router.get('/view-forms', isAuthenticated(roles.testDeveloper), (req, res, next) => testDeveloper2Controller.getViewFormsPage(req, res, next))
router.get('/upload-new-forms', isAuthenticated(roles.testDeveloper), (req, res, next) => testDeveloper2Controller.getUploadNewFormsPage(req, res, next))
router.post('/upload', isAuthenticated(roles.testDeveloper), (req, res, next) => testDeveloper2Controller.postUpload(req, res, next))
router.get('/delete/:urlSlug', isAuthenticated(roles.testDeveloper), (req, res, next) => testDeveloper2Controller.getDelete(req, res, next))
router.get('/view/:urlSlug', isAuthenticated(roles.testDeveloper), (req, res, next) => testDeveloper2Controller.getViewFormPage(req, res, next))
router.get('/assign-forms-to-check-windows', isAuthenticated(roles.testDeveloper), (req, res, next) => testDeveloper2Controller.getAssignFormsPage(req, res, next))
router.get('/select-form/:checkFormType/:checkWindowUrlSlug', isAuthenticated(roles.testDeveloper), (req, res, next) => testDeveloper2Controller.getSelectFormPage(req, res, next))
router.post('/assign-forms/:checkFormType/:checkWindowUrlSlug', isAuthenticated(roles.testDeveloper), (req, res, next) => testDeveloper2Controller.postAssignForms(req, res, next))

module.exports = router
