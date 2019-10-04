const roles = require('../lib/consts/roles')
const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const isAdminWindowAvailable = require('../availability/middleware')

const group = require('../controllers/group')

router.get(
  '/pupils-list',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => group.groupPupilsPage(req, res, next)
)
router.get(
  '/pupils-list/add',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => group.manageGroupPage(req, res, next)
)
router.get(
  '/pupils-list/edit/:groupId',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => group.manageGroupPage(req, res, next)
)
router.post(
  '/pupils-list/add',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => group.addGroup(req, res, next)
)
router.post(
  '/pupils-list/edit',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => group.editGroup(req, res, next)
)
router.get(
  '/pupils-list/delete/:groupId',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  (req, res, next) => group.removeGroup(req, res, next)
)

module.exports = router
