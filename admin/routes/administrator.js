'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const config = require('../config')
const {
  getUpdateTiming,
  setUpdateTiming,
  getCheckWindows,
  checkWindowsForm,
  getAdministration,
  saveCheckWindows,
  removeCheckWindow } = require('../controllers/administrator')

/* Administration page */
router.get('/home', isAuthenticated(config.ROLE_TEST_DEVELOPER), (req, res) => getAdministration(req, res))
router.get('/check-windows', isAuthenticated(), (req, res, next) => getCheckWindows(req, res, next))
router.get('/check-windows/remove/:checkWindowId', isAuthenticated(), (req, res, next) => removeCheckWindow(req, res, next))
router.get('/check-windows/:action', isAuthenticated(), (req, res, next) => checkWindowsForm(req, res, next))
router.get('/check-windows/:action/:id', isAuthenticated(), (req, res, next) => checkWindowsForm(req, res, next))
router.get('/check-windows/:sortField/:sortDirection', isAuthenticated(), (req, res, next) => getCheckWindows(req, res, next))
router.get('/check-windows/:sortField/:sortDirection/:error', isAuthenticated(), (req, res, next) => getCheckWindows(req, res, next))
router.post('/check-windows/add', isAuthenticated(), (req, res, next) => saveCheckWindows(req, res, next))
router.post('/check-windows/edit', isAuthenticated(), (req, res, next) => saveCheckWindows(req, res, next))
router.get('/check-settings', isAuthenticated(), (req, res, next) => getUpdateTiming(req, res, next))
router.get('/check-settings/:status', isAuthenticated(), (req, res, next) => getUpdateTiming(req, res, next))
router.post('/check-settings', isAuthenticated(), (req, res, next) => setUpdateTiming(req, res, next))

module.exports = router
