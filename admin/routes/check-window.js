'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const roles = require('../lib/consts/roles')
const checkWindowController = require('../controllers/check-window')
const featureToggles = require('feature-toggles')

if (featureToggles.isFeatureEnabled('newCheckWindow')) {
  /* Check Window routing */
  router.get('/manage-check-windows', isAuthenticated(roles.serviceManager), (req, res, next) => checkWindowController.getManageCheckWindows(req, res, next))
  router.get('/create-check-window', isAuthenticated(roles.serviceManager), (req, res, next) => checkWindowController.createCheckWindow(req, res, next))
  router.post('/submit-check-window', isAuthenticated(roles.serviceManager), (req, res, next) => checkWindowController.submitCheckWindow(req, res, next))
  router.get('/remove/:checkWindowUrlSlug', isAuthenticated(roles.serviceManager), (req, res, next) => checkWindowController.removeCheckWindow(req, res, next))
  router.get('/edit/:checkWindowUrlSlug', isAuthenticated(roles.serviceManager), (req, res, next) => checkWindowController.getCheckWindowEditForm(req, res, next))
}

module.exports = router
