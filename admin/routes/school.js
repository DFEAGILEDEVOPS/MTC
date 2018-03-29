'use strict'

const rolesConfig = require('../roles-config')
const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')

const schoolController = require('../controllers/school')

router.get(
  ['/', '/school-home'],
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => schoolController.getSchoolLandingPage(req, res, next)
)

module.exports = router
