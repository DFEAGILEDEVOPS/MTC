'use strict'

const roles = require('../lib/consts/roles')
const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const { isAdminWindowAvailable } = require('../availability/middleware')

const schoolController = require('../controllers/school')

router.get(
  ['/', '/school-home'],
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  schoolController.getSchoolLandingPage
)

module.exports = router
