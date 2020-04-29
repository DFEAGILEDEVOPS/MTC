'use strict'

const roles = require('../lib/consts/roles')
const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const techSupportHomeController = require('../controllers/tech-support-home')

router.get(
  ['/home'],
  isAuthenticated([roles.techSupport]),
  (req, res, next) => techSupportHomeController.getTechSupportHomePage(req, res, next)
)

module.exports = router
