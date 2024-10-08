const roles = require('../lib/consts/roles')
const express = require('express')
const isAuthenticated = require('../authentication/middleware')
const { isAdminWindowAvailable } = require('../availability/middleware')
const router = express.Router()
const restartController = require('../controllers/restart')

router.get(
  '/overview',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  restartController.getRestartOverview
)
router.get(
  '/select-restart-list',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  restartController.getSelectRestartList
)
router.post(
  '/submit-restart-list',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  restartController.postSubmitRestartList
)
router.post(
  '/delete',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  restartController.postDeleteRestart
)

router.post(
  '/allow-discretionary-restart',
  isAdminWindowAvailable,
  isAuthenticated([roles.staAdmin]),
  restartController.postSubmitAllowDiscretionaryRestart
)

router.post(
  '/remove-discretionary-restart',
  isAdminWindowAvailable,
  isAuthenticated([roles.staAdmin]),
  restartController.postSubmitRevokeDiscretionaryRestart
)

module.exports = router
