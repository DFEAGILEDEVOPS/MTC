'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const roles = require('../lib/consts/roles')
const testDeveloperController = require('../controllers/test-developer')
const testDeveloper2Controller = require('../controllers/test-developer2')
const payloadController = require('../controllers/pupil-payload-viewer')

router.get('/',
  isAuthenticated(roles.testDeveloper),
  testDeveloperController.getTestDeveloperHomePage
)

router.get('/home',
  isAuthenticated(roles.testDeveloper),
  testDeveloperController.getTestDeveloperHomePage
)

router.get('/download-pupil-check-data',
  isAuthenticated(roles.testDeveloper),
  testDeveloperController.getDownloadPupilCheckData
)

router.get('/file-download-pupil-check-data/:urlSlug',
  isAuthenticated(roles.testDeveloper),
  testDeveloperController.getFileDownloadPupilCheckData
)

router.get('/view-pupil-payload',
  isAuthenticated(roles.testDeveloper),
  payloadController.getViewPayloadForm
)

router.get('/raw-pupil-payload',
  isAuthenticated(roles.testDeveloper),
  payloadController.rawPupilPayload
)

router.get('/view-forms',
  isAuthenticated(roles.testDeveloper),
  testDeveloper2Controller.getViewFormsPage
)

router.get('/upload-new-forms',
  isAuthenticated(roles.testDeveloper),
  testDeveloper2Controller.getUploadNewFormsPage
)

router.post('/upload',
  isAuthenticated(roles.testDeveloper),
  testDeveloper2Controller.postUpload
)

router.get('/delete/:urlSlug',
  isAuthenticated(roles.testDeveloper),
  testDeveloper2Controller.getDelete
)

router.get('/view/:urlSlug',
  isAuthenticated(roles.testDeveloper),
  testDeveloper2Controller.getViewFormPage
)

router.get('/assign-forms-to-check-windows',
  isAuthenticated(roles.testDeveloper),
  testDeveloper2Controller.getAssignFormsPage
)

router.get('/select-form/:checkFormType/:checkWindowUrlSlug',
  isAuthenticated(roles.testDeveloper),
  testDeveloper2Controller.getSelectFormPage
)

router.post('/assign-forms/:checkFormType/:checkWindowUrlSlug',
  isAuthenticated(roles.testDeveloper),
  testDeveloper2Controller.postAssignForms
)

module.exports = router
