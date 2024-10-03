const roles = require('../lib/consts/roles')
const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const { isAdminWindowAvailable } = require('../availability/middleware')

const group = require('../controllers/group')

router.get(
  '/pupils-list',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  group.groupPupilsPage
)
router.get(
  '/pupils-list/add',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  group.manageGroupPage
)
router.get(
  '/pupils-list/edit/:groupId',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  group.manageGroupPage
)
router.post(
  '/pupils-list/add',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  group.addGroup
)
router.post(
  '/pupils-list/edit',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  group.editGroup
)
router.get(
  '/pupils-list/delete/:groupId',
  isAdminWindowAvailable,
  isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
  group.removeGroup
)

module.exports = router
