'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const roles = require('../lib/consts/roles')
const serviceManagerController = require('../controllers/service-manager')

/* Service Manager routing */
router.get('/home', isAuthenticated(roles.serviceManager), (req, res, next) => serviceManagerController.getServiceManagerHome(req, res, next))
router.get('/check-settings', isAuthenticated(roles.serviceManager), (req, res, next) => serviceManagerController.getUpdateTiming(req, res, next))
router.get('/check-settings/:status', isAuthenticated(roles.serviceManager), (req, res, next) => serviceManagerController.getUpdateTiming(req, res, next))
router.post('/check-settings', isAuthenticated(roles.serviceManager), (req, res, next) => serviceManagerController.setUpdateTiming(req, res, next))
router.get('/upload-pupil-census', isAuthenticated(roles.serviceManager), (req, res, next) => serviceManagerController.getUploadPupilCensus(req, res, next))
router.post('/upload-pupil-census/upload', isAuthenticated(roles.serviceManager), (req, res, next) => serviceManagerController.postUploadPupilCensus(req, res, next))
router.get('/upload-pupil-census/delete/:pupilCensusId', isAuthenticated(roles.serviceManager), (req, res, next) => serviceManagerController.getRemovePupilCensus(req, res, next))
router.get('/mod-settings', isAuthenticated(roles.serviceManager), (req, res, next) => serviceManagerController.getSceSettings(req, res, next))
router.post('/mod-settings', isAuthenticated(roles.serviceManager), (req, res, next) => serviceManagerController.postSceSettings(req, res, next))
router.get('/mod-settings/cancel', isAuthenticated(roles.serviceManager), (req, res) => serviceManagerController.cancelSceSettings(req, res))
router.get('/mod-settings/add-school', isAuthenticated(roles.serviceManager), (req, res, next) => serviceManagerController.getSceAddSchool(req, res, next))
router.post('/mod-settings/add-school', isAuthenticated(roles.serviceManager), (req, res, next) => serviceManagerController.postSceAddSchool(req, res, next))
router.get('/mod-settings/remove-school/:urn', isAuthenticated(roles.serviceManager), (req, res, next) => serviceManagerController.getSceRemoveSchool(req, res, next))

module.exports = router
