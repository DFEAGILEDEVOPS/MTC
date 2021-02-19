'use strict'

const roles = require('../lib/consts/roles')
const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const techSupportController = require('../controllers/tech-support')

router.get(
  '/home',
  isAuthenticated([roles.techSupport]),
  techSupportController.getHomePage
)

router.get(
  '/checkview',
  isAuthenticated([roles.techSupport]),
  techSupportController.getCheckViewPage
)

router.post(
  '/checkview',
  isAuthenticated([roles.techSupport]),
  techSupportController.postCheckViewPage
)

router.get(
  '/received-check-payload',
  isAuthenticated([roles.techSupport]),
  techSupportController.getReceivedCheckPayload
)

router.get(
  '/redis-overview',
  isAuthenticated([roles.techSupport]),
  techSupportController.showRedisOverview
)

module.exports = router
