'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const roles = require('../lib/consts/roles')
const resultsController = require('../controllers/results')
const { isAdminWindowAvailable } = require('../availability/middleware')

/* Check Form v2 routing */
router.get('/view-results',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  resultsController.getViewResultsPage
)

router.get('/ctf-download',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  resultsController.getCtfDownload
)

module.exports = router
