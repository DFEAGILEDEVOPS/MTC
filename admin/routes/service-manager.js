'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const config = require('../config')
const serviceManagerController = require('../controllers/service-manager')

/* Service Manager routing */
router.get('/home', isAuthenticated(config.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.getServiceManagerHome(req, res, next))
router.get('/check-windows', isAuthenticated(config.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.getCheckWindows(req, res, next))
router.get('/check-windows/remove/:checkWindowId', isAuthenticated(config.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.removeCheckWindow(req, res, next))
router.get('/check-windows/:action', isAuthenticated(config.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.checkWindowsForm(req, res, next))
router.get('/check-windows/:action/:id', isAuthenticated(config.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.checkWindowsForm(req, res, next))
router.get('/check-windows/:sortField/:sortDirection', isAuthenticated(config.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.getCheckWindows(req, res, next))
router.get('/check-windows/:sortField/:sortDirection/:error', isAuthenticated(config.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.getCheckWindows(req, res, next))
router.post('/check-windows/add', isAuthenticated(config.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.saveCheckWindows(req, res, next))
router.post('/check-windows/edit', isAuthenticated(config.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.saveCheckWindows(req, res, next))
router.get('/check-settings', isAuthenticated(config.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.getUpdateTiming(req, res, next))
router.get('/check-settings/:status', isAuthenticated(config.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.getUpdateTiming(req, res, next))
router.post('/check-settings', isAuthenticated(config.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.setUpdateTiming(req, res, next))

module.exports = router
