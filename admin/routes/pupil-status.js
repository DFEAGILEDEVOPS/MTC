'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const roles = require('../lib/consts/roles')
const pupilStatusController = require('../controllers/pupil-status')

/* Pupil Status routing */
router.get('/', isAuthenticated([roles.teacher, roles.helpdesk]), (req, res, next) => pupilStatusController.getViewPupilStatus(req, res, next))

module.exports = router
