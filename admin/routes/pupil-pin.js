const roles = require('../lib/consts/roles')
const express = require('express')
const isAuthenticated = require('../authentication/middleware')
const { isAdminWindowAvailable } = require('../availability/middleware')
const router = express.Router()

const {
  getGeneratePinsOverview,
  getGeneratePinsList,
  postGeneratePins,
  getViewAndCustomPrintPins,
  getSelectOfficialOrTryItOutPinGen
} = require('../controllers/pupil-pin')

router.get(
  '/select-official-or-try-it-out',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  getSelectOfficialOrTryItOutPinGen
)

router.get(
  '/generate-:pinEnv-pins-overview',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  getGeneratePinsOverview
)
router.get(
  '/generate-:pinEnv-pins-list/:groupIds?',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  getGeneratePinsList
)
router.post(
  '/generate-:pinEnv-pins',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  postGeneratePins
)
router.get(
  '/view-and-custom-print-:pinEnv-pins',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  getViewAndCustomPrintPins
)

module.exports = router
