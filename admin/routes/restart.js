const roles = require('../lib/consts/roles')
const express = require('express')
const isAuthenticated = require('../authentication/middleware')
const isAdminWindowAvailable = require('../availability/middleware')
const router = express.Router()
const restartController = require('../controllers/restart')

router.get(
  '/overview',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  restartController.getRestartOverview
)
router.get(
  '/select-restart-list',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  restartController.getSelectRestartList
)
router.post(
  '/submit-restart-list',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  restartController.postSubmitRestartList
)
router.post(
  '/delete',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  restartController.postDeleteRestart
)

module.exports = router
