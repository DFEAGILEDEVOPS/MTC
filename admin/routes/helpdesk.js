'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const rolesConfig = require('../roles-config')
const helpdeskController = require('../controllers/helpdesk')

router.get('/', isAuthenticated(rolesConfig.ROLE_HELPDESK), (req, res, next) => helpdeskController.getSchoolImpersonation(req, res, next))
router.get('/school-impersonation', isAuthenticated(rolesConfig.ROLE_HELPDESK), (req, res, next) => helpdeskController.getSchoolImpersonation(req, res, next))
router.post('/school-impersonation', isAuthenticated(rolesConfig.ROLE_HELPDESK), (req, res, next) => helpdeskController.postSchoolImpersonation(req, res, next))
router.get('/home', isAuthenticated(rolesConfig.ROLE_HELPDESK), (req, res, next) => helpdeskController.getHelpdeskHome(req, res, next))

module.exports = router
