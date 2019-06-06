'use strict'

const logger = require('../services/log.service').getLogger()

function isAuthenticated (role) {
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      let userRole
      if (req.user) {
        userRole = ((req.user).role || {})
      }
      logger.debug(`checking authorisation on ${req.url} for role:${role} against userRole:${userRole}`)
      if (role === undefined || (role !== undefined && userRole && role === userRole)) {
        return next()
      } else {
        logger.warn(`could not authorise ${role} against userRole:${userRole}, UserName:${req.user.UserName} ID:${req.user.id}`)
        return res.redirect('/unauthorised')
      }
    }
    res.redirect('/sign-in')
  }
}

module.exports = isAuthenticated
