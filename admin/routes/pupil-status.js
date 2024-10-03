'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const roles = require('../lib/consts/roles')
const pupilStatusController = require('../controllers/pupil-status')
const { isAdminWindowAvailable } = require('../availability/middleware')

/* Pupil Status routing */
router.get('/',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  pupilStatusController.getViewPupilStatus
)

module.exports = router
