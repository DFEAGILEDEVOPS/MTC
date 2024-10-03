'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const roles = require('../lib/consts/roles')
const checkWindowController = require('../controllers/check-window')
const featureToggles = require('feature-toggles')

if (featureToggles.isFeatureEnabled('newCheckWindow')) {
  /* Check Window routing  - SM feature */
  router.get('/manage-check-windows',
    isAuthenticated(roles.serviceManager),
    checkWindowController.getManageCheckWindows
  )
  router.get('/create-check-window',
    isAuthenticated(roles.serviceManager),
    checkWindowController.createCheckWindow
  )
  router.post('/submit-check-window',
    isAuthenticated(roles.serviceManager),
    checkWindowController.submitCheckWindow
  )
  router.get('/remove/:checkWindowUrlSlug',
    isAuthenticated(roles.serviceManager),
    checkWindowController.removeCheckWindow
  )
  router.get('/edit/:checkWindowUrlSlug',
    isAuthenticated(roles.serviceManager),
    checkWindowController.getCheckWindowEditForm
  )
}

module.exports = router
