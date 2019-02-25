'use strict'

const moment = require('moment')
const config = require('../config')
const checkWindowV2Service = require('../services/check-window-v2.service')

async function isAdminWindowAvailable (req, res, next) {
  if (config.OVERRIDE_AVAILABILITY_MIDDLEWARE) {
    return next()
  }
  const currentDate = moment.utc()
  const checkWindow = await checkWindowV2Service.getActiveCheckWindow()
  if (!checkWindow || !currentDate.isBetween(checkWindow.adminStartDate, checkWindow.adminEndDate)) {
    res.locals.pageTitle = 'Unavailable'
    return res.render('availability/admin-window-unavailable', {
      currentDate,
      checkWindow,
      startDateFormatted: checkWindow.adminStartDate.format('dddd D MMMM YYYY')
    })
  }
  return next()
}

module.exports = isAdminWindowAvailable
