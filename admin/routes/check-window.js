'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const rolesConfig = require('../roles-config')
const checkWindowController = require('../controllers/check-window')

/* Check Window routing */
router.get('/manage-check-windows', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => checkWindowController.getManageCheckWindows(req, res, next))

module.exports = router
