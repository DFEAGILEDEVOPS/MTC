'use strict'

const moment = require('moment')
const config = require('../config')
const checkWindowV2Service = require('../services/check-window-v2.service')
const dateService = require('../services/date.service')

async function isAdminWindowAvailable (req, res, next) {
  if (config.OVERRIDE_AVAILABILITY_MIDDLEWARE) {
    return next()
  }
  try {
    const currentDate = moment.utc()
    let checkWindow = await checkWindowV2Service.getActiveCheckWindow()
    // if there is no current active check window, default to the latest found
    if (!checkWindow) checkWindow = await checkWindowV2Service.getLatestCheckWindow()
    if (checkWindow && currentDate.isBetween(checkWindow.adminStartDate, checkWindow.adminEndDate)) {
      req.checkWindow = checkWindow
      return next()
    }
    const isBeforeStartDate = checkWindow && currentDate.isBefore(checkWindow.adminStartDate)
    const startDateFormatted = checkWindow && dateService.formatDayDateAndYear(checkWindow.adminStartDate)
    res.locals.pageTitle = 'Unavailable'
    return res.render('availability/admin-window-unavailable', {
      isBeforeStartDate,
      startDateFormatted
    })
  } catch (error) {
    next(error)
  }
}

module.exports = isAdminWindowAvailable
