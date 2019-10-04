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
  (req, res, next) => restartController.getRestartOverview(req, res, next)
)
router.get(
  '/select-restart-list',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => restartController.getSelectRestartList(req, res, next)
)
router.post(
  '/submit-restart-list',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => restartController.postSubmitRestartList(req, res, next)
)
router.post(
  '/delete',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => restartController.postDeleteRestart(req, res, next)
)

module.exports = router
