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
  pupilsNotTakingTheCheck.getSelectPupilNotTakingCheck
)
router.get(
  '/save-pupils',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  pupilsNotTakingTheCheck.getSelectPupilNotTakingCheck
)
router.post(
  '/save-pupils',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  pupilsNotTakingTheCheck.savePupilNotTakingCheck
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
  pupilsNotTakingTheCheck.viewPupilsNotTakingTheCheck
)
router.get(
  ['/', '/pupils-list'],
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  pupilsNotTakingTheCheck.getPupilNotTakingCheck
)
router.get(
  '/:removed',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  pupilsNotTakingTheCheck.getPupilNotTakingCheck
)

module.exports = router
