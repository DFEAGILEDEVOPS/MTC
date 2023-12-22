'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const roles = require('../lib/consts/roles')
const serviceMessageController = require('../controllers/service-message')

/* Service Message routing */
router.get('/',
  isAuthenticated(roles.serviceManager),
  serviceMessageController.getServiceMessage
)

router.get('/service-message-form',
  isAuthenticated(roles.serviceManager),
  serviceMessageController.getServiceMessageForm
)

router.post('/submit-service-message',
  isAuthenticated(roles.serviceManager),
  serviceMessageController.postSubmitServiceMessage
)

router.post('/remove/:slug',
  isAuthenticated(roles.serviceManager),
  serviceMessageController.postRemoveServiceMessage
)

router.get('/edit/:slug',
  isAuthenticated(roles.serviceManager),
  serviceMessageController.getEditServiceMessage
)

module.exports = router
