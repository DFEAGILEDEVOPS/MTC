const config = require('../config')
const express = require('express')
const isAuthenticated = require('../authentication/middleware')
const router = express.Router()
const restartController = require('../controllers/restart')

router.get('/overview', isAuthenticated(config.ROLE_TEACHER), (req, res) => restartController.getRestartOverview(req, res))
router.get('/select-restart-list', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => restartController.getSelectRestartList(req, res, next))
router.post('/submit-restart-list', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => restartController.postSubmitRestartList(req, res, next))

module.exports = router
