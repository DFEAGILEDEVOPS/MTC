'use strict'

const roles = require('../lib/consts/roles')
const emergencyOffSwitchService = require('../services/emergency-off-switch.service')

const signOutPaths = ['/sign-out', '/sign-out-dso']

async function emergencyOffSwitchMiddleware (req, res, next) {
  if (!req.isAuthenticated() || !req.user || req.user.role !== roles.teacher) {
    return next()
  }

  const requestPath = req.path.replace(/\/+$/, '') || '/'
  if (signOutPaths.includes(requestPath)) {
    return next()
  }

  try {
    const state = await emergencyOffSwitchService.get()
    if (typeof state.isEnabled !== 'boolean') {
      throw new Error('Emergency off-switch state is invalid')
    }
    if (!state.isEnabled) {
      return next()
    }

    res.locals.pageTitle = 'The service is temporarily unavailable'
    return res.render('availability/emergency-off-switch-service-unavailable', {})
  } catch (error) {
    return next(error)
  }
}

module.exports = emergencyOffSwitchMiddleware
