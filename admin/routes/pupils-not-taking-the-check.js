const roles = require('../lib/consts/roles')
const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const isAdminWindowAvailable = require('../availability/middleware')

const pupilsNotTakingTheCheck = require('../controllers/pupils-not-taking-the-check')

router.get(
  '/select-pupils/:groupIds?',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => pupilsNotTakingTheCheck.getSelectPupilNotTakingCheck(req, res, next)
)
router.get(
  '/save-pupils',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => pupilsNotTakingTheCheck.getSelectPupilNotTakingCheck(req, res, next)
)
router.post(
  '/save-pupils',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => pupilsNotTakingTheCheck.savePupilNotTakingCheck(req, res, next)
)
router.get(
  '/remove/:pupilId',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => pupilsNotTakingTheCheck.removePupilNotTakingCheck(req, res, next)
)
router.get(
  '/view',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => pupilsNotTakingTheCheck.viewPupilsNotTakingTheCheck(req, res, next)
)
router.get(
  ['/', '/pupils-list'],
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => pupilsNotTakingTheCheck.getPupilNotTakingCheck(req, res, next)
)
router.get(
  '/:removed',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => pupilsNotTakingTheCheck.getPupilNotTakingCheck(req, res, next)
)

module.exports = router
