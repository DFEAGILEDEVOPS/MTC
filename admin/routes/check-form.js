'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const roles = require('../lib/consts/roles')
const checkFormV2Controller = require('../controllers/check-form-v2')
const featureToggles = require('feature-toggles')

if (featureToggles.isFeatureEnabled('newCheckForm')) {
  /* Check Form v2 routing */
  router.get('/view-forms', isAuthenticated(roles.testDeveloper), (req, res, next) => checkFormV2Controller.getViewFormsPage(req, res, next))
  router.get('/upload-new-forms', isAuthenticated(roles.testDeveloper), (req, res, next) => checkFormV2Controller.getUploadNewFormsPage(req, res, next))
  router.post('/upload', isAuthenticated(roles.testDeveloper), (req, res, next) => checkFormV2Controller.postUpload(req, res, next))
  router.get('/delete/:urlSlug', isAuthenticated(roles.testDeveloper), (req, res, next) => checkFormV2Controller.getDelete(req, res, next))
  router.get('/view/:urlSlug', isAuthenticated(roles.testDeveloper), (req, res, next) => checkFormV2Controller.getViewFormPage(req, res, next))
  router.get('/assign-forms-to-check-windows', isAuthenticated(roles.testDeveloper), (req, res, next) => checkFormV2Controller.getAssignFormsPage(req, res, next))
  router.get('/select-form/:checkFormType/:checkWindowUrlSlug', isAuthenticated(roles.testDeveloper), (req, res, next) => checkFormV2Controller.getSelectFormPage(req, res, next))
  router.post('/assign-forms/:checkFormType/:checkWindowUrlSlug', isAuthenticated(roles.testDeveloper), (req, res, next) => checkFormV2Controller.postAssignForms(req, res, next))
}

module.exports = router
