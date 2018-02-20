'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const rolesConfig = require('../roles-config')
const serviceManagerController = require('../controllers/service-manager')
const downloadFile = require('../controllers/downloadFile')

/* Service Manager routing */
router.get('/home', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.getServiceManagerHome(req, res, next))
router.get('/check-windows', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.getCheckWindows(req, res, next))
router.get('/check-windows/remove/:checkWindowId', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.removeCheckWindow(req, res, next))
router.get('/check-windows/:action', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.checkWindowsForm(req, res, next))
router.get('/check-windows/:action/:id', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.checkWindowsForm(req, res, next))
router.get('/check-windows/:sortField/:sortDirection', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.getCheckWindows(req, res, next))
router.get('/check-windows/:sortField/:sortDirection/:error', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.getCheckWindows(req, res, next))
router.post('/check-windows/add', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.saveCheckWindows(req, res, next))
router.post('/check-windows/edit', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.saveCheckWindows(req, res, next))
router.get('/check-settings', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.getUpdateTiming(req, res, next))
router.get('/check-settings/:status', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.getUpdateTiming(req, res, next))
router.post('/check-settings', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => serviceManagerController.setUpdateTiming(req, res, next))
router.get('/download-guidance', isAuthenticated(rolesConfig.ROLE_SERVICE_MANAGER), (req, res, next) => downloadFile(req, res, next))

module.exports = router
