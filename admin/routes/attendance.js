const rolesConfig = require('../roles-config')
const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const isAdminWindowAvailable = require('../availability/middleware')

const attendance = require('../controllers/attendance')

router.get(
  ['/', '/results'],
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  isAdminWindowAvailable,
  (req, res, next) => attendance.getResults(req, res, next)
)
router.get(
  '/download-results',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  isAdminWindowAvailable,
  (req, res, next) => attendance.downloadResults(req, res, next)
)

router.get(
  '/declaration-form',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  isAdminWindowAvailable,
  (req, res, next) => attendance.getDeclarationForm(req, res, next)
)
router.post(
  '/submit-declaration-form',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  isAdminWindowAvailable,
  (req, res, next) => attendance.postDeclarationForm(req, res, next)
)
router.get(
  '/review-pupil-details',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  isAdminWindowAvailable,
  (req, res, next) => attendance.getReviewPupilDetails(req, res, next)
)
router.get(
  '/edit-reason/:urlSlug',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  isAdminWindowAvailable,
  (req, res, next) => attendance.getEditReason(req, res, next)
)
router.post(
  '/submit-edit-reason',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  isAdminWindowAvailable,
  (req, res, next) => attendance.postSubmitEditReason(req, res, next)
)
router.get(
  '/confirm-and-submit',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  isAdminWindowAvailable,
  (req, res, next) => attendance.getConfirmSubmit(req, res, next)
)
router.post(
  '/confirm-and-submit',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  isAdminWindowAvailable,
  (req, res, next) => attendance.postConfirmSubmit(req, res, next)
)
router.get(
  '/submitted',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  isAdminWindowAvailable,
  (req, res, next) => attendance.getHDFSubmitted(req, res, next)
)
router.get(
  '/submitted-form',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  isAdminWindowAvailable,
  (req, res, next) => attendance.getHDFSubmittedForm(req, res, next)
)

module.exports = router
