'use strict'

const moment = require('moment')
const config = require('../config')
const checkWindowV2Service = require('../services/check-window-v2.service')
const dateService = require('../services/date.service')
const settingsService = require('../services/setting.service')

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

    const isBeforeStartDate = checkWindow && currentDate.isBefore(checkWindow.adminStartDate)
    const startDateFormatted = checkWindow && dateService.formatDayDateAndYear(checkWindow.adminStartDate)
    const academicYear = getAcademicYear(checkWindow.checkStartDate)
    res.locals.pageTitle = 'Unavailable'
    return res.render('availability/admin-window-unavailable', {
      academicYear,
      isBeforeStartDate,
      startDateFormatted
    })
  } catch (error) {
    next(error)
  }
}

/**
   * The UK academic year starts in September and continues through to August of the following year.
   * TODO: move to lib
   * @param {moment.Moment} date
   * @return {number}
   */
function getAcademicYear (date) {
  const i = date.month()
  const y = date.year()
  const september = 8 // zero-based
  if (i >= september) {
    return y
  }
  return y - 1
}

module.exports = isAdminWindowAvailable
