'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const rolesConfig = require('../roles-config')
const accessArrengementsController = require('../controllers/access-arrangements')

/* Service Manager routing */
router.get('/overview', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => accessArrengementsController.getOverview(req, res, next))
router.get('/select-access-arrangements', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => accessArrengementsController.getSelectAccessArrangements(req, res, next))

module.exports = router
