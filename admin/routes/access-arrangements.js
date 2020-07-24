'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const isAdminWindowAvailable = require('../availability/middleware')
const featureToggles = require('feature-toggles')
const roles = require('../lib/consts/roles')
const accessArrangementsController = require('../controllers/access-arrangements')

if (featureToggles.isFeatureEnabled('accessArrangements')) {
  /* Access arrangements routing */
  router.get(
    '/overview',
    isAuthenticated([roles.teacher, roles.helpdesk]),
    isAdminWindowAvailable,
    accessArrangementsController.getOverview
  )
  router.get(
    '/select-access-arrangements',
    isAuthenticated([roles.teacher, roles.helpdesk]),
    isAdminWindowAvailable,
    accessArrangementsController.getSelectAccessArrangements
  )
  router.get(
    '/select-access-arrangements/:pupilUrlSlug',
    isAuthenticated([roles.teacher, roles.helpdesk]),
    isAdminWindowAvailable,
    accessArrangementsController.getEditAccessArrangements
  )
  router.post(
    '/submit',
    isAuthenticated([roles.teacher, roles.helpdesk]),
    isAdminWindowAvailable,
    accessArrangementsController.postSubmitAccessArrangements
  )
  router.get(
    '/delete-access-arrangements/:pupilUrlSlug',
    isAuthenticated([roles.teacher, roles.helpdesk]),
    isAdminWindowAvailable,
    accessArrangementsController.getDeleteAccessArrangements
  )
  router.get(
    '/retro-add-input-assistant',
    isAuthenticated([roles.teacher, roles.helpdesk]),
    isAdminWindowAvailable,
    accessArrangementsController.getAddInputAssistant
  )
}

module.exports = router
