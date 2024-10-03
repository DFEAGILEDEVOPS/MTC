'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const { isAdminWindowAvailable } = require('../availability/middleware')
const featureToggles = require('feature-toggles')
const roles = require('../lib/consts/roles')
const accessArrangementsController = require('../controllers/access-arrangements')
const retroInputAssistantController = require('../controllers/retro-input-assistant')

if (featureToggles.isFeatureEnabled('accessArrangements')) {
  /* Access arrangements routing */
  router.get(
    '/overview',
    isAdminWindowAvailable,
    isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
    accessArrangementsController.getOverview
  )
  router.get(
    '/select-access-arrangements',
    isAdminWindowAvailable,
    isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
    accessArrangementsController.getSelectAccessArrangements
  )
  router.get(
    '/select-access-arrangements/:pupilUrlSlug',
    isAdminWindowAvailable,
    isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
    accessArrangementsController.getEditAccessArrangements
  )
  router.post(
    '/submit',
    isAdminWindowAvailable,
    isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
    accessArrangementsController.postSubmitAccessArrangements
  )
  router.get(
    '/delete-access-arrangements/:pupilUrlSlug',
    isAdminWindowAvailable,
    isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
    accessArrangementsController.getDeleteAccessArrangements
  )
  router.get(
    '/retro-add-input-assistant',
    isAdminWindowAvailable,
    isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
    (req, res, next) => retroInputAssistantController.getAddRetroInputAssistant(req, res, next)
  )
  router.post(
    '/retro-add-input-assistant-submit',
    isAdminWindowAvailable,
    isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
    (req, res, next) => retroInputAssistantController.postSubmitRetroInputAssistant(req, res, next)
  )
  router.get(
    '/delete-retro-input-assistant/:pupilUrlSlug',
    isAdminWindowAvailable,
    isAuthenticated([roles.teacher, roles.helpdesk, roles.staAdmin]),
    (req, res, next) => retroInputAssistantController.getDeleteRetroInputAssistant(req, res, next)
  )
}

module.exports = router
