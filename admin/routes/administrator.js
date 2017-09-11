'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const { getUpdateTiming, setUpdateTiming, getCheckWindows } = require('../controllers/administrator')

/* GET manage check forms page. */
router.get('/check-windows', isAuthenticated(), (req, res, next) => getCheckWindows(req, res, next))
router.get('/check-settings', isAuthenticated(), (req, res, next) => getUpdateTiming(req, res, next))
router.get('/check-settings/:status', isAuthenticated(), (req, res, next) => getUpdateTiming(req, res, next))
router.post('/check-settings', isAuthenticated(), (req, res, next) => setUpdateTiming(req, res, next))

module.exports = router
