const rolesConfig = require('../roles-config')
const express = require('express')
const isAuthenticated = require('../authentication/middleware')
const router = express.Router()
const restartController = require('../controllers/restart')

router.get('/overview', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => restartController.getRestartOverview(req, res, next))
router.get('/select-restart-list', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => restartController.getSelectRestartList(req, res, next))
router.post('/submit-restart-list', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => restartController.postSubmitRestartList(req, res, next))
router.post('/delete', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => restartController.postDeleteRestart(req, res, next))

module.exports = router
