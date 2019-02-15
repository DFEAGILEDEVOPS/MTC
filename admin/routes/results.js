'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const rolesConfig = require('../roles-config')
const resultsController = require('../controllers/results')

/* Check Form v2 routing */
router.get('/view-results', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => resultsController.getViewResultsPage(req, res, next))

module.exports = router
