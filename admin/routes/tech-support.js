'use strict'

const roles = require('../lib/consts/roles')
const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const techSupportController = require('../controllers/tech-support')

router.get(
  '/home',
  isAuthenticated([roles.techSupport]),
  (req, res, next) => techSupportController.getHomePage(req, res, next)
)

router.get(
  '/checkview',
  isAuthenticated([roles.techSupport]),
  (req, res, next) => techSupportController.getCheckViewPage(req, res, next)
)

router.post(
  '/checkview',
  isAuthenticated([roles.techSupport]),
  (req, res, next) => techSupportController.postCheckViewPage(req, res, next)
)

router.get(
  '/received-check-payload',
  isAuthenticated([roles.techSupport]),
  (req, res, next) => techSupportController.getReceivedCheckPayload(req, res, next)
)

module.exports = router
