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
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  isAdminWindowAvailable,
  getSelectOfficialOrTryItOutPinGen
)

router.get(
  '/generate-:pinEnv-pins-overview',
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  isAdminWindowAvailable,
  getGeneratePinsOverview
)
router.get(
  '/generate-:pinEnv-pins-list/:groupIds?',
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  isAdminWindowAvailable,
  getGeneratePinsList
)
router.post(
  '/generate-:pinEnv-pins',
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  isAdminWindowAvailable,
  postGeneratePins
)
router.get(
  '/view-and-custom-print-:pinEnv-pins',
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  isAdminWindowAvailable,
  getViewAndCustomPrintPins
)

module.exports = router
