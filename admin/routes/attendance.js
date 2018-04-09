const rolesConfig = require('../roles-config')
const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')

const attendance = require('../controllers/attendance')

router.get(
  ['/', '/results'],
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => attendance.getResults(req, res, next)
)
router.get(
  '/download-results',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => attendance.downloadResults(req, res, next)
)
router.get(
  '/submit-attendance',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => attendance.getSubmitAttendance(req, res, next)
)
router.post(
  '/submit-attendance-form',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => attendance.postSubmitAttendance(req, res, next)
)
router.get(
  '/declaration-form',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => attendance.getDeclarationForm(req, res, next)
)
router.post(
  '/submit-declaration-form',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => attendance.postDeclarationForm(req, res, next)
)
router.get(
  '/declaration-form-submitted',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => attendance.getHDFSubmitted(req, res, next)
)

module.exports = router
