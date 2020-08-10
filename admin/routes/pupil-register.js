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
  pupilRegister.listPupils
)
router.get(
  '/pupil/add',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  pupilController.getAddPupil
)
router.post(
  '/pupil/add',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  pupilController.postAddPupil
)
router.get(
  '/pupil/add-batch-pupils',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  pupilController.getAddMultiplePupils
)
router.post(
  '/pupil/add-batch-pupils',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  pupilController.postAddMultiplePupils
)
router.get(
  '/pupil/download-error-csv',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  pupilController.getErrorCSVFile
)
router.get(
  '/pupil/edit/:id',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  pupilController.getEditPupilById
)
router.post(
  '/pupil/edit',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  pupilController.postEditPupil
)

module.exports = router
