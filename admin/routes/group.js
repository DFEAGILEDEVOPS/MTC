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
  group.groupPupilsPage
)
router.get(
  '/pupils-list/add',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  group.manageGroupPage
)
router.get(
  '/pupils-list/edit/:groupId',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  group.manageGroupPage
)
router.post(
  '/pupils-list/add',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  group.addGroup
)
router.post(
  '/pupils-list/edit',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  group.editGroup
)
router.get(
  '/pupils-list/delete/:groupId',
  isAuthenticated([roles.teacher, roles.helpdesk]),
  isAdminWindowAvailable,
  group.removeGroup
)

module.exports = router
