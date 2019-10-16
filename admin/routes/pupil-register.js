'use strict'

const roles = require('../lib/consts/roles')
const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const isAdminWindowAvailable = require('../availability/middleware')

const pupilRegister = require('../controllers/pupil-register')
const pupilController = require('../controllers/pupil')

router.get(
  ['/', '/pupils-list'],
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => pupilRegister.listPupils(req, res, next)
)
router.get(
  '/pupil/add',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => pupilController.getAddPupil(req, res, next)
)
router.post(
  '/pupil/add',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => pupilController.postAddPupil(req, res, next)
)
router.get(
  '/pupil/add-batch-pupils',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => pupilController.getAddMultiplePupils(req, res, next)
)
router.post(
  '/pupil/add-batch-pupils',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => pupilController.postAddMultiplePupils(req, res, next)
)
router.get(
  '/pupil/download-error-csv',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res) => pupilController.getErrorCSVFile(req, res)
)
router.get(
  '/pupil/edit/:id',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => pupilController.getEditPupilById(req, res, next)
)
router.post(
  '/pupil/edit',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => pupilController.postEditPupil(req, res, next)
)

module.exports = router
