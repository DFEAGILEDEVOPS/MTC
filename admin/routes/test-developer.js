'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const roles = require('../lib/consts/roles')
const testDeveloperController = require('../controllers/test-developer')
const payloadController = require('../controllers/pupil-payload-viewer')

router.get('/', isAuthenticated(roles.testDeveloper), (req, res, next) => testDeveloperController.getTestDeveloperHomePage(req, res, next))
router.get('/home', isAuthenticated(roles.testDeveloper), (req, res, next) => testDeveloperController.getTestDeveloperHomePage(req, res, next))
router.get('/download-pupil-check-data', isAuthenticated(roles.testDeveloper), (req, res, next) => testDeveloperController.getDownloadPupilCheckData(req, res, next))
router.get('/file-download-pupil-check-data/:urlSlug', isAuthenticated(roles.testDeveloper), (req, res, next) => testDeveloperController.getFileDownloadPupilCheckData(req, res, next))
router.get('/view-pupil-payload', isAuthenticated(roles.testDeveloper), (req, res, next) => payloadController.getViewPayloadForm(req, res, next))
router.get('/raw-pupil-payload', isAuthenticated(roles.testDeveloper), (req, res, next) => payloadController.rawPupilPayload(req, res, next))

module.exports = router
