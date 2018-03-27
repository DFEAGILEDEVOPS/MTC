const rolesConfig = require('../roles-config')
const express = require('express')
const isAuthenticated = require('../authentication/middleware')
const router = express.Router()

const pupilRegister = require('../controllers/pupil-register')

router.get(
  '/pupil-register/:sortField/:sortDirection',
  isAuthenticated(rolesConfig.ROLE_TEACHER),
  (req, res, next) => pupilRegister.pupilList(req, res, next)
)

module.exports = router
