'use strict'

const logger = require('../services/log.service').getLogger()

function isAuthenticated (arg) {
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      let roles = typeof arg === 'string' && arg.length > 1
        ? [arg] : arg
      let userRole
      if (req.user) {
        userRole = ((req.user).role || {})
      }
      logger.debug(`checking authorisation on ${req.url} for roles:${roles && roles.join()} against userRole:${userRole}`)
      if (roles === undefined || (Array.isArray(roles) && roles.some(r => r === userRole))) {
        return next()
      } else {
        logger.warn(`could not authorise ${roles.join()} against userRole:${userRole}, UserName:${req.user.UserName} ID:${req.user.id}`)
        return res.redirect('/unauthorised')
      }
    }
    res.redirect('/sign-in')
  }
}

module.exports = isAuthenticated
