'use strict'

const moment = require('moment')
const config = require('../config')
const checkWindowV2Service = require('../services/check-window-v2.service')
const settingsService = require('../services/setting.service')
const checkWindowPhaseConsts = require('../lib/consts/check-window-phase')

async function isAdminWindowAvailable (req, res, next) {
  // If this env var is set it will ignore this check entirely
  if (config.OVERRIDE_AVAILABILITY_MIDDLEWARE) {
    return next()
  }
  try {
    const currentDate = moment.utc()
    const checkWindow = await checkWindowV2Service.getActiveCheckWindow()
    if (checkWindow && currentDate.isBetween(checkWindow.adminStartDate, checkWindow.adminEndDate)) {
      return next()
    }

    // Check to see if it should run in Read Only mode if the adminEndDate has passed
    const settings = await settingsService.get()
    if (settings.isPostAdminEndDateUnavailable === false) {
      // It should run in read-only mode, and should let this particular check succeed.  The details
      // of which actions can be allowed or disallowed are checked in the controllers and services.
      return next()
    }

    res.locals.pageTitle = 'The service is currently closed'
    return res.render('availability/admin-window-unavailable', {})
  } catch (error) {
    next(error)
  }
}

async function isPostLiveOrLaterCheckPhase (req, res, next) {
  // If this env var is set it will ignore this check entirely
  if (config.OVERRIDE_AVAILABILITY_MIDDLEWARE) {
    return next()
  }
  /**
   * global.checkWindowPhase is an int. Later phases have larger number.
   */
  try {
    if (global.checkWindowPhase >= checkWindowPhaseConsts.postCheckAdmin) {
      res.locals.pageTitle = 'Section unavailable'
      req.breadcrumbs(res.locals.pageTitle)
      return res.render('availability/section-unavailable', { breadcrumbs: req.breadcrumbs(), title: 'Section unavailable' })
    }
    return next()
  } catch (error) {
    next(error)
  }
}

module.exports = { isAdminWindowAvailable, isPostLiveOrLaterCheckPhase }
