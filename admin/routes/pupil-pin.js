const roles = require('../lib/consts/roles')
const express = require('express')
const isAuthenticated = require('../authentication/middleware')
const isAdminWindowAvailable = require('../availability/middleware')
const router = express.Router()

const {
  getGeneratePinsOverview,
  getGeneratePinsList,
  postGeneratePins,
  getViewAndPrintPins,
  getViewAndCustomPrintPins
} = require('../controllers/pupil-pin')

router.get(
  '/generate-:pinEnv-pins-overview',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => getGeneratePinsOverview(req, res, next)
)
router.get(
  '/generate-:pinEnv-pins-list/:groupIds?',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => getGeneratePinsList(req, res, next)
)
router.post(
  '/generate-:pinEnv-pins',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => postGeneratePins(req, res, next)
)
router.get(
  '/view-and-custom-print-:pinEnv-pins',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => getViewAndCustomPrintPins(req, res, next)
)
router.get(
  '/view-and-print-:pinEnv-pins',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => getViewAndPrintPins(req, res, next)
)

module.exports = router
