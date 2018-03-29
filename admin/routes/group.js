const rolesConfig = require('../roles-config')
const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')

const group = require('../controllers/group')

router.get(
  '/pupils-list',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => group.groupPupilsPage(req, res, next)
)
router.get(
  '/pupils-list/add',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => group.manageGroupPage(req, res, next)
)
router.get(
  '/pupils-list/edit/:groupId',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => group.manageGroupPage(req, res, next)
)
router.post(
  '/pupils-list/add',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => group.addGroup(req, res, next)
)
router.post(
  '/pupils-list/edit',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => group.editGroup(req, res, next)
)
router.get(
  '/pupils-list/delete/:groupId',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => group.removeGroup(req, res, next)
)

module.exports = router
