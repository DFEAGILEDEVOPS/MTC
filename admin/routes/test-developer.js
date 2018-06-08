'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const rolesConfig = require('../roles-config')
const checkFormController = require('../controllers/check-form')

router.get('/', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.getTestDeveloperHomePage(req, res, next))
router.get('/home', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.getTestDeveloperHomePage(req, res, next))
router.get('/upload-and-view-forms/:sortField/:sortDirection', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.uploadAndViewFormsPage(req, res, next))
router.get('/upload-and-view-forms', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.uploadAndViewFormsPage(req, res, next))
router.get('/view-form/:formId', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.displayCheckForm(req, res, next))
router.get('/delete-form/:formId', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.removeCheckForm(req, res, next))
router.get('/upload-new-form', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.uploadCheckForm(req, res, next))
router.post('/upload-new-form', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.saveCheckForm(req, res, next))
router.get('/assign-form-to-window', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.assignCheckFormsToWindowsPage(req, res, next))
router.get('/assign-form-to-window/:checkWindowId', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.assignCheckFormToWindowPage(req, res, next))
router.post('/assign-form-to-window', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.saveAssignCheckFormsToWindow(req, res, next))
router.get('/unassign-forms/:checkWindowId', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.unassignCheckFormsFromWindowPage(req, res, next))
router.post('/unassign-form', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.unassignCheckFormFromWindow(req, res, next))
router.get('/download-pupil-check-data', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.getDownloadPupilCheckData(req, res, next))
router.get('/generate-latest-pupil-check-data', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.getGenerateLatestPupilCheckData(req, res, next))
router.get('/csv-download-pupil-check-data', isAuthenticated(rolesConfig.ROLE_TEST_DEVELOPER), (req, res, next) => checkFormController.getCsvDownloadPupilCheckData(req, res, next))

module.exports = router
