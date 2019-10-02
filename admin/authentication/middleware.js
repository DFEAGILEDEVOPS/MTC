'use strict'

const R = require('ramda')

const logger = require('../services/log.service').getLogger()

function isAuthenticated (arg) {
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      const roles = !Array.isArray(arg) ? [arg] : arg
      let userRole
      if (req.user) {
        userRole = req.user && req.user.role
      }
      logger.debug(`checking authorisation on ${req.url} for roles:${roles && roles.join()} against userRole:${userRole}`)
      if (Array.isArray(roles) && R.includes(userRole, roles)) {
        return next()
      } else {
        logger.warn(`could not authorise ${roles && roles.join()} against userRole:${userRole}, UserName:${req.user.UserName} ID:${req.user.id}`)
        return res.redirect('/unauthorised')
      }
    }
    res.redirect('/sign-in')
  }
}

module.exports = isAuthenticated
