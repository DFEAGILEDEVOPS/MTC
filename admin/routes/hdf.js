const roles = require('../lib/consts/roles')
const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const isAdminWindowAvailable = require('../availability/middleware')

const hdfController = require('../controllers/hdf')

router.get(
  ['/', '/results'],
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => hdfController.getResults(req, res, next)
)
router.get(
  '/download-results',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => hdfController.downloadResults(req, res, next)
)

router.get(
  '/declaration-form',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => hdfController.getDeclarationForm(req, res, next)
)
router.post(
  '/submit-declaration-form',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => hdfController.postDeclarationForm(req, res, next)
)
router.get(
  '/review-pupil-details',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => hdfController.getReviewPupilDetails(req, res, next)
)
router.get(
  '/edit-reason/:urlSlug',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => hdfController.getEditReason(req, res, next)
)
router.post(
  '/submit-edit-reason',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => hdfController.postSubmitEditReason(req, res, next)
)
router.get(
  '/confirm-and-submit',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => hdfController.getConfirmSubmit(req, res, next)
)
router.post(
  '/confirm-and-submit',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => hdfController.postConfirmSubmit(req, res, next)
)
router.get(
  '/submitted',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => hdfController.getHDFSubmitted(req, res, next)
)
router.get(
  '/submitted-form',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => hdfController.getHDFSubmittedForm(req, res, next)
)

module.exports = router
