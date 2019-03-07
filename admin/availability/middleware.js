'use strict'

const moment = require('moment')
const config = require('../config')
const checkWindowV2Service = require('../services/check-window-v2.service')
const dateService = require('../services/date.service')

async function isAdminWindowAvailable (req, res, next) {
  if (config.OVERRIDE_AVAILABILITY_MIDDLEWARE) {
    return next()
  }
  const currentDate = moment.utc()
  const checkWindow = await checkWindowV2Service.getActiveCheckWindow()
  if (checkWindow && currentDate.isBetween(checkWindow.adminStartDate, checkWindow.adminEndDate)) {
    return next()
  }
  const isBeforeStartDate = checkWindow && currentDate.isBefore(checkWindow.adminStartDate)
  const startDateFormatted = checkWindow && dateService.formatDayDateAndYear(checkWindow.adminStartDate)
  res.locals.pageTitle = 'Unavailable'
  return res.render('availability/admin-window-unavailable', {
    isBeforeStartDate,
    startDateFormatted
  })
}

module.exports = isAdminWindowAvailable
