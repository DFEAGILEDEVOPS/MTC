'use strict'

const logger = require('../services/log.service').getLogger()

function isAuthenticated (roles) {
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      let userRole
      if (req.user) {
        userRole = ((req.user).role || {})
      }
      logger.debug(`checking authorisation on ${req.url} for role:${roles} against userRole:${userRole}`)
      // declare single role variable if input is not array of roles
      const role = !Array.isArray(roles) && roles
      if (role === undefined ||
        (role !== undefined && userRole && role === userRole) ||
        (Array.isArray(roles) && roles.some(r => r === userRole))) {
        return next()
      } else {
        logger.warn(`could not authorise ${[roles].join()} against userRole:${userRole}, UserName:${req.user.UserName} ID:${req.user.id}`)
        return res.redirect('/unauthorised')
      }
    }
    res.redirect('/sign-in')
  }
}

module.exports = isAuthenticated
