const roles = require('../lib/consts/roles')
const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const { isAdminWindowAvailable } = require('../availability/middleware')

const hdfController = require('../controllers/hdf')

router.get(
  ['/', '/results'],
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  isAdminWindowAvailable,
  hdfController.getResults
)
router.get(
  '/download-results',
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  isAdminWindowAvailable,
  hdfController.downloadResults
)

router.get(
  '/declaration-form',
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  isAdminWindowAvailable,
  hdfController.getDeclarationForm
)
router.post(
  '/submit-declaration-form',
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  isAdminWindowAvailable,
  hdfController.postDeclarationForm
)
router.get(
  '/review-pupil-details',
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  isAdminWindowAvailable,
  hdfController.getReviewPupilDetails
)
router.get(
  '/edit-reason/:urlSlug',
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  isAdminWindowAvailable,
  hdfController.getEditReason
)
router.post(
  '/submit-edit-reason',
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  isAdminWindowAvailable,
  hdfController.postSubmitEditReason
)
router.get(
  '/confirm-and-submit',
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  isAdminWindowAvailable,
  hdfController.getConfirmSubmit
)
router.post(
  '/confirm-and-submit',
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  isAdminWindowAvailable,
  hdfController.postConfirmSubmit
)
router.get(
  '/submitted',
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  isAdminWindowAvailable,
  hdfController.getHDFSubmitted
)
router.get(
  '/submitted-form',
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  isAdminWindowAvailable,
  hdfController.getHDFSubmittedForm
)

module.exports = router
