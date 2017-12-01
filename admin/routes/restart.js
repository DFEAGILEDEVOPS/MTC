const config = require('../config')
const express = require('express')
const isAuthenticated = require('../authentication/middleware')
const router = express.Router()

const {
  getRestartOverview,
  getSelectRestartList
} = require('../controllers/restart')

router.get('/overview', isAuthenticated(config.ROLE_TEACHER), (req, res) => getRestartOverview(req, res))
router.get('/select-restart-list', isAuthenticated(config.ROLE_TEACHER), (req, res, next) => getSelectRestartList(req, res, next))

module.exports = router
