'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const roles = require('../lib/consts/roles')
const serviceMessageController = require('../controllers/service-message')

/* Service Message routing */
router.get('/',
  isAuthenticated([roles.serviceManager, roles.superUser]),
  serviceMessageController.getServiceMessage
)

router.get('/service-message-form',
  isAuthenticated([roles.serviceManager, roles.superUser]),
  serviceMessageController.getServiceMessageForm
)

router.post('/submit-service-message',
  isAuthenticated([roles.serviceManager, roles.superUser]),
  serviceMessageController.postSubmitServiceMessage
)

router.post('/remove/:slug',
  isAuthenticated([roles.serviceManager, roles.superUser]),
  serviceMessageController.postRemoveServiceMessage
)

router.get('/edit/:slug',
  isAuthenticated([roles.serviceManager, roles.superUser]),
  serviceMessageController.getEditServiceMessage
)

module.exports = router
