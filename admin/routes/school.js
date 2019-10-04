'use strict'

const rolesConfig = require('../roles-config')
const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const isAdminWindowAvailable = require('../availability/middleware')

const schoolController = require('../controllers/school')

router.get(
  ['/', '/school-home'],
  isAuthenticated([rolesConfig.ROLE_TEACHER, rolesConfig.ROLE_HELPDESK]),
  isAdminWindowAvailable,
  (req, res, next) => schoolController.getSchoolLandingPage(req, res, next)
)

module.exports = router
