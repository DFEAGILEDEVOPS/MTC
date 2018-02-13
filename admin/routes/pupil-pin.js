const rolesConfig = require('../roles-config')
const express = require('express')
const isAuthenticated = require('../authentication/middleware')
const router = express.Router()

const {
  getGeneratePinsOverview,
  getGeneratePinsList,
  postGeneratePins,
  getGeneratedPinsList,
  getPrintPins
} = require('../controllers/pupil-pin')

router.get('/generate-pins-overview', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getGeneratePinsOverview(req, res, next))
router.get('/generate-pins-list/:sortField/:sortDirection/:groupIds?', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getGeneratePinsList(req, res, next))
router.post('/generate-pins', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => postGeneratePins(req, res, next))
router.get('/generated-pins-list', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getGeneratedPinsList(req, res, next))
router.get('/print-pins', isAuthenticated(rolesConfig.ROLE_TEACHER), (req, res, next) => getPrintPins(req, res, next))

module.exports = router
