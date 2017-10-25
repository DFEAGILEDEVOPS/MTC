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
router.get('/check-windows', isAuthenticated(config.ROLE_TEST_DEVELOPER), (req, res, next) => getCheckWindows(req, res, next))
router.get('/check-windows/remove/:checkWindowId', isAuthenticated(config.ROLE_TEST_DEVELOPER), (req, res, next) => removeCheckWindow(req, res, next))
router.get('/check-windows/:action', isAuthenticated(config.ROLE_TEST_DEVELOPER), (req, res, next) => checkWindowsForm(req, res, next))
router.get('/check-windows/:action/:id', isAuthenticated(config.ROLE_TEST_DEVELOPER), (req, res, next) => checkWindowsForm(req, res, next))
router.get('/check-windows/:sortField/:sortDirection', isAuthenticated(config.ROLE_TEST_DEVELOPER), (req, res, next) => getCheckWindows(req, res, next))
router.get('/check-windows/:sortField/:sortDirection/:error', isAuthenticated(config.ROLE_TEST_DEVELOPER), (req, res, next) => getCheckWindows(req, res, next))
router.post('/check-windows/add', isAuthenticated(config.ROLE_TEST_DEVELOPER), (req, res, next) => saveCheckWindows(req, res, next))
router.post('/check-windows/edit', isAuthenticated(config.ROLE_TEST_DEVELOPER), (req, res, next) => saveCheckWindows(req, res, next))
router.get('/check-settings', isAuthenticated(config.ROLE_TEST_DEVELOPER), (req, res, next) => getUpdateTiming(req, res, next))
router.get('/check-settings/:status', isAuthenticated(config.ROLE_TEST_DEVELOPER), (req, res, next) => getUpdateTiming(req, res, next))
router.post('/check-settings', isAuthenticated(config.ROLE_TEST_DEVELOPER), (req, res, next) => setUpdateTiming(req, res, next))

module.exports = router
