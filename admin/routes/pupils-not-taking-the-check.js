const roles = require('../lib/consts/roles')
const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const { isAdminWindowAvailable, refuseIfHdfSigned } = require('../availability/middleware')
const pupilsNotTakingTheCheck = require('../controllers/pupils-not-taking-the-check')

router.get(
  '/select-pupils/:groupIds?',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin, roles.superUser]),
  pupilsNotTakingTheCheck.getSelectPupilNotTakingCheck
)
router.get(
  '/save-pupils',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin, roles.superUser]),
  pupilsNotTakingTheCheck.getSelectPupilNotTakingCheck
)
router.post(
  '/save-pupils',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin, roles.superUser]),
  pupilsNotTakingTheCheck.savePupilNotTakingCheck
)
router.get(
  '/remove/:pupilId',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin, roles.superUser]),
  refuseIfHdfSigned,
  (req, res, next) => pupilsNotTakingTheCheck.removePupilNotTakingCheck(req, res, next)
)
router.get(
  '/view',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin, roles.superUser]),
  pupilsNotTakingTheCheck.viewPupilsNotTakingTheCheck
)
router.get(
  ['/', '/pupils-list'],
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin, roles.superUser]),
  pupilsNotTakingTheCheck.getPupilNotTakingCheck
)
router.get(
  '/:removed',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin, roles.superUser]),
  pupilsNotTakingTheCheck.getPupilNotTakingCheck
)

module.exports = router
