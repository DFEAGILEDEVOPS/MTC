'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const roles = require('../lib/consts/roles')
const helpdeskImpersonationController = require('../controllers/helpdesk-impersonation')
const helpdeskSummaryController = require('../controllers/helpdesk-summary')

router.get('/', isAuthenticated(roles.helpdesk), (req, res, next) => helpdeskImpersonationController.getSchoolImpersonation(req, res, next))
router.get('/school-impersonation', isAuthenticated(roles.helpdesk), (req, res, next) => helpdeskImpersonationController.getSchoolImpersonation(req, res, next))
router.post('/add-school-impersonation', isAuthenticated(roles.helpdesk), (req, res, next) => helpdeskImpersonationController.postAddSchoolImpersonation(req, res, next))
router.post('/remove-school-impersonation', isAuthenticated(roles.helpdesk), (req, res, next) => helpdeskImpersonationController.postRemoveSchoolImpersonation(req, res, next))
router.get('/home', isAuthenticated(roles.helpdesk), (req, res, next) => helpdeskImpersonationController.getSchoolLandingPage(req, res, next))
router.get('school-summary/:dfenumber', isAuthenticated(roles.helpdesk), (req, res, next) => helpdeskSummaryController.getSummary(req, res, next))
router.get('/helpdesk-home', isAuthenticated(roles.helpdesk), (req, res, next) => )
module.exports = router
