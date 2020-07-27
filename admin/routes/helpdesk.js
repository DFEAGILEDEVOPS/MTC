'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const roles = require('../lib/consts/roles')
const helpdeskImpersonationController = require('../controllers/helpdesk-impersonation')
const helpdeskSummaryController = require('../controllers/helpdesk-summary')

router.get('/',
  isAuthenticated(roles.helpdesk),
  helpdeskImpersonationController.getSchoolImpersonation
)
router.get('/school-impersonation',
  isAuthenticated(roles.helpdesk),
  helpdeskImpersonationController.getSchoolImpersonation
)
router.post('/add-school-impersonation',
  isAuthenticated(roles.helpdesk),
  helpdeskImpersonationController.postAddSchoolImpersonation
)
router.post('/remove-school-impersonation',
  isAuthenticated(roles.helpdesk),
  helpdeskImpersonationController.postRemoveSchoolImpersonation
)

// router.get('/home',
//   isAuthenticated(roles.helpdesk),
//   helpdeskImpersonationController.getSchoolLandingPage
// )

router.get('/school-summary',
  isAuthenticated(roles.helpdesk),
  helpdeskSummaryController.getSummary
)

module.exports = router
