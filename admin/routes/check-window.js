'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const rolesConfig = require('../roles-config')
const checkWindowController = require('../controllers/check-window')
const featureToggles = require('feature-toggles')

if (featureToggles.isFeatureEnabled('newCheckWindow')) {
  /* Check Window routing */
  router.get('/manage-check-windows', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => checkWindowController.getManageCheckWindows(req, res, next))
  router.get('/create-check-window', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => checkWindowController.createCheckWindow(req, res, next))
}

module.exports = router
