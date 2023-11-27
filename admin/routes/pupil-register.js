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
  isAdminWindowAvailable,
  pupilRegister.listPupils
)
router.get(
  '/pupil/add',
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  isPostLiveOrLaterCheckPhase,
  pupilController.getAddPupil
)
router.post(
  '/pupil/add',
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  isPostLiveOrLaterCheckPhase,
  pupilController.postAddPupil
)
router.get(
  '/pupil/add-batch-pupils',
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  isPostLiveOrLaterCheckPhase,
  pupilController.getAddMultiplePupils
)
router.post(
  '/pupil/add-batch-pupils',
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  isPostLiveOrLaterCheckPhase,
  pupilController.postAddMultiplePupils
)
router.get(
  '/pupil/download-error-csv',
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  isPostLiveOrLaterCheckPhase,
  pupilController.getErrorCSVFile
)
router.get(
  '/pupil/edit/:id',
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  isPostLiveOrLaterCheckPhase,
  pupilController.getEditPupilById
)
router.post(
  '/pupil/edit',
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  isPostLiveOrLaterCheckPhase,
  pupilController.postEditPupil
)
router.get(
  '/history/:urlSlug',
  isAuthenticated([roles.staAdmin, roles.helpdesk]),
  isAdminWindowAvailable,
  pupilController.getViewPupilHistory
)

module.exports = router
