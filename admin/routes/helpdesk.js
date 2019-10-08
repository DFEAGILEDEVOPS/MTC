'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const roles = require('../lib/consts/roles')
const helpdeskController = require('../controllers/helpdesk')

router.get('/', isAuthenticated(roles.helpdesk), (req, res, next) => helpdeskController.getSchoolImpersonation(req, res, next))
router.get('/school-impersonation', isAuthenticated(roles.helpdesk), (req, res, next) => helpdeskController.getSchoolImpersonation(req, res, next))
router.post('/add-school-impersonation', isAuthenticated(roles.helpdesk), (req, res, next) => helpdeskController.postAddSchoolImpersonation(req, res, next))
router.post('/remove-school-impersonation', isAuthenticated(roles.helpdesk), (req, res, next) => helpdeskController.postRemoveSchoolImpersonation(req, res, next))
router.get('/home', isAuthenticated(roles.helpdesk), (req, res, next) => helpdeskController.getSchoolLandingPage(req, res, next))

module.exports = router
