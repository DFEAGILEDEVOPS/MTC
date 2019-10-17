'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const roles = require('../lib/consts/roles')
const serviceMessageController = require('../controllers/service-message')

/* Service Message routing */
router.get('/', isAuthenticated(roles.serviceManager), (req, res, next) => serviceMessageController.getServiceMessage(req, res, next))
router.get('/service-message-form', isAuthenticated(roles.serviceManager), (req, res, next) => serviceMessageController.getServiceMessageForm(req, res, next))
router.post('/submit-service-message', isAuthenticated(roles.serviceManager), (req, res, next) => serviceMessageController.postSubmitServiceMessage(req, res, next))
router.post('/remove-service-message', isAuthenticated(roles.serviceManager), (req, res, next) => serviceMessageController.postRemoveServiceMessage(req, res, next))

module.exports = router
