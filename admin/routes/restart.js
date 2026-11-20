const roles = require('../lib/consts/roles')
const express = require('express')
const isAuthenticated = require('../authentication/middleware')
const { isAdminWindowAvailable } = require('../availability/middleware')
const router = express.Router()
const restartController = require('../controllers/restart')

router.get(
  '/overview',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin, roles.superUser]),
  restartController.getRestartOverview
)
router.get(
  '/select-restart-list',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin, roles.superUser]),
  restartController.getSelectRestartList
)
router.post(
  '/submit-restart-list',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin, roles.superUser]),
  restartController.postSubmitRestartList
)
router.post(
  '/delete',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin, roles.superUser]),
  restartController.postDeleteRestart
)

router.post(
  '/allow-discretionary-restart',
  isAdminWindowAvailable,
  isAuthenticated([roles.staAdmin, roles.superUser]),
  restartController.postSubmitAllowDiscretionaryRestart
)

router.post(
  '/remove-discretionary-restart',
  isAdminWindowAvailable,
  isAuthenticated([roles.staAdmin, roles.superUser]),
  restartController.postSubmitRevokeDiscretionaryRestart
)

module.exports = router
