const rolesConfig = require('../roles-config')
const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')

const pupilsNotTakingTheCheck = require('../controllers/pupils-not-taking-the-check')

router.get(
  '/select-pupils/:groupIds?',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => pupilsNotTakingTheCheck.getSelectPupilNotTakingCheck(req, res, next)
)
router.get(
  '/save-pupils',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => pupilsNotTakingTheCheck.getSelectPupilNotTakingCheck(req, res, next)
)
router.post(
  '/save-pupils',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => pupilsNotTakingTheCheck.savePupilNotTakingCheck(req, res, next)
)
router.get(
  '/remove/:pupilId',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => pupilsNotTakingTheCheck.removePupilNotTakingCheck(req, res, next)
)
router.get(
  '/view',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => pupilsNotTakingTheCheck.viewPupilsNotTakingTheCheck(req, res, next)
)
router.get(
  ['/', '/pupils-list'],
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => pupilsNotTakingTheCheck.getPupilNotTakingCheck(req, res, next)
)
router.get(
  '/:removed',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => pupilsNotTakingTheCheck.getPupilNotTakingCheck(req, res, next)
)

module.exports = router
