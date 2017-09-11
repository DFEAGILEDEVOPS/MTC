'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const { getAdministration, getUpdateTiming, setUpdateTiming } = require('../controllers/administrator')
const config = require('../config')

/* Administration page */
router.get('/home', isAuthenticated(config.ROLE_TEST_DEVELOPER), (req, res) => getAdministration(req, res))
router.get('/check-settings', isAuthenticated(config.ROLE_TEST_DEVELOPER), (req, res, next) => getUpdateTiming(req, res, next))
router.get('/check-settings/:status', isAuthenticated(config.ROLE_TEST_DEVELOPER), (req, res, next) => getUpdateTiming(req, res, next))
router.post('/check-settings', isAuthenticated(config.ROLE_TEST_DEVELOPER), (req, res, next) => setUpdateTiming(req, res, next))

module.exports = router
