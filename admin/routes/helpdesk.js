'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const rolesConfig = require('../roles-config')
const helpdeskController = require('../controllers/helpdesk')

router.get('/', isAuthenticated(rolesConfig.ROLE_HELPDESK), (req, res, next) => helpdeskController.getSchoolImpersonation(req, res, next))
router.get('/school-impersonation', isAuthenticated(rolesConfig.ROLE_HELPDESK), (req, res, next) => helpdeskController.getSchoolImpersonation(req, res, next))
router.post('/add-school-impersonation', isAuthenticated(rolesConfig.ROLE_HELPDESK), (req, res, next) => helpdeskController.postAddSchoolImpersonation(req, res, next))
router.post('/remove-school-impersonation', isAuthenticated(rolesConfig.ROLE_HELPDESK), (req, res, next) => helpdeskController.postRemoveSchoolImpersonation(req, res, next))
router.get('/home', isAuthenticated(rolesConfig.ROLE_HELPDESK), (req, res, next) => helpdeskController.getSchoolLandingPage(req, res, next))

module.exports = router
