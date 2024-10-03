const roles = require('../lib/consts/roles')
const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const { isAdminWindowAvailable } = require('../availability/middleware')

const hdfController = require('../controllers/hdf')

router.get(
  ['/', '/results'],
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  hdfController.getResults
)
router.get(
  '/download-results',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  hdfController.downloadResults
)

router.get(
  '/declaration-form',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  hdfController.getDeclarationForm
)
router.post(
  '/submit-declaration-form',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  hdfController.postDeclarationForm
)
router.get(
  '/review-pupil-details',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  hdfController.getReviewPupilDetails
)
router.get(
  '/edit-reason/:urlSlug',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  hdfController.getEditReason
)
router.post(
  '/submit-edit-reason',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  hdfController.postSubmitEditReason
)
router.get(
  '/confirm-and-submit',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  hdfController.getConfirmSubmit
)
router.post(
  '/confirm-and-submit',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  hdfController.postConfirmSubmit
)
router.get(
  '/submitted',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  hdfController.getHDFSubmitted
)
router.get(
  '/submitted-form',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  hdfController.getHDFSubmittedForm
)

module.exports = router
