'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const roles = require('../lib/consts/roles')
const resultsController = require('../controllers/results')

/* Check Form v2 routing */
router.get('/view-results',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  (req, res, next) => resultsController.getViewResultsPage(req, res, next)
)

module.exports = router
