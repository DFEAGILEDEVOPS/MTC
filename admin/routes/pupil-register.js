'use strict'

const rolesConfig = require('../roles-config')
const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')

const pupilRegister = require('../controllers/pupil-register')
const pupilController = require('../controllers/pupil')

router.get(
  ['/', '/pupils-list/:sortField/:sortDirection'],
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => pupilRegister.listPupils(req, res, next)
)
router.get(
  '/pupil/add',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => pupilController.getAddPupil(req, res, next)
)
router.post(
  '/pupil/add',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => pupilController.postAddPupil(req, res, next)
)
router.get(
  '/pupil/add-batch-pupils',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => pupilController.getAddMultiplePupils(req, res, next)
)
router.post(
  '/pupil/add-batch-pupils',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => pupilController.postAddMultiplePupils(req, res, next)
)
router.get(
  '/pupil/download-error-csv',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res) => pupilController.getErrorCSVFile(req, res)
)
router.get(
  '/pupil/edit/:id',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => pupilController.getEditPupilById(req, res, next)
)
router.post(
  '/pupil/edit',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => pupilController.postEditPupil(req, res, next)
)
router.get(
  '/print-pupils',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => pupilController.getPrintPupils(req, res, next)
)

module.exports = router
