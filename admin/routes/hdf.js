const roles = require('../lib/consts/roles')
const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const { isAdminWindowAvailable } = require('../availability/middleware')

const hdfController = require('../controllers/hdf')

router.get(
  ['/', '/results'],
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin, roles.superUser]),
  hdfController.getResults
)
router.get(
  '/download-results',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin, roles.superUser]),
  hdfController.downloadResults
)

router.get(
  '/declaration-form',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin, roles.superUser]),
  hdfController.getDeclarationForm
)
router.post(
  '/submit-declaration-form',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin, roles.superUser]),
  hdfController.postDeclarationForm
)
router.get(
  '/review-pupil-details',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin, roles.superUser]),
  hdfController.getReviewPupilDetails
)
router.get(
  '/edit-reason/:urlSlug',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin, roles.superUser]),
  hdfController.getEditReason
)
router.post(
  '/submit-edit-reason',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin, roles.superUser]),
  hdfController.postSubmitEditReason
)
router.get(
  '/confirm-and-submit',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin, roles.superUser]),
  hdfController.getConfirmSubmit
)
router.post(
  '/confirm-and-submit',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin, roles.superUser]),
  hdfController.postConfirmSubmit
)
router.get(
  '/submitted',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin, roles.superUser]),
  hdfController.getHDFSubmitted
)
router.get(
  '/submitted-form',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin, roles.superUser]),
  hdfController.getHDFSubmittedForm
)

module.exports = router
