'use strict'

const winston = require('winston')

function isAuthenticated (role) {
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      winston.debug('user authenticated:', req.user)
      const userRole = ((req.user).role || {})
      winston.debug('role:', userRole)
      if (role === undefined || (role !== undefined && userRole && role === userRole)) {
        return next()
      } else {
        winston.debug(`could not authorise ${role} against userRole:${userRole}`)
        return res.redirect('/unauthorised')
      }
    }
    res.redirect('/sign-in')
  }
}

module.exports = isAuthenticated
