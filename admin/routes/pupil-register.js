'use strict'

const roles = require('../lib/consts/roles')
const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const { isAdminWindowAvailable, isPostLiveOrLaterCheckPhase } = require('../availability/middleware')

const pupilRegister = require('../controllers/pupil-register')
const pupilController = require('../controllers/pupil')

router.get(
  ['/', '/pupils-list'],
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  pupilRegister.listPupils
)
router.get(
  '/pupil/add',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  pupilController.getAddPupil
)
router.post(
  '/pupil/add',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  pupilController.postAddPupil
)
router.get(
  '/pupil/add-batch-pupils',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  pupilController.getAddMultiplePupils
)
router.post(
  '/pupil/add-batch-pupils',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  pupilController.postAddMultiplePupils
)
router.get(
  '/pupil/download-error-csv',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  isPostLiveOrLaterCheckPhase,
  pupilController.getErrorCSVFile
)
router.get(
  '/pupil/edit/:id',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  pupilController.getEditPupilById
)
router.post(
  '/pupil/edit',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  pupilController.postEditPupil
)
router.get(
  '/history/:urlSlug',
  isAdminWindowAvailable,
  isAuthenticated([roles.staAdmin, roles.helpdesk]),
  isAdminWindowAvailable,
  pupilController.getViewPupilHistory
)

module.exports = router
