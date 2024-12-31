'use strict'

const moment = require('moment')
const { getBuildNumber } = require('./healthcheck')
const config = require('../config')
const roles = require('../lib/consts/roles.js')
const pjson = require('../package.json')
const dateService = require('../services/date.service')

const formatPageTitle = function (pageTitle) {
  let title = 'GOV.UK'
  if (typeof pageTitle !== 'undefined') {
    title = pageTitle + ' - ' + title
  }
  return title
}

/**
 *
 * @param {Date} date
 * @return {String} e.g 2 May 2017
 */
const formatGdsDate = function (date) {
  return moment(date).format('D MMM YYYY')
}

const formatGdsDateAndTime = function (date) {
  return moment(date).format('D MMM h:mm a')
}

/**
 *
 * @param {Date} date
 * @return {String} e.g 2 May 2017
 */
const formatFullGdsDate = function (date) {
  return moment(date).format('D MMMM YYYY')
}

const formatFullGdsDateAndTime = function (date) {
  return date.format('D MMMM YYYY h:mm a')
}

module.exports = async function (app) {
  'use strict'
  if (typeof app === 'undefined') throw new Error('express application object required')
  let buildNumber
  try {
    buildNumber = await getBuildNumber()
  } catch {
    buildNumber = 'NOT FOUND'
  }
  // Ensure we initialise the `isAuthenticated` variable so that it is defined
  // even if the database is not yet up.
  app.locals.isAuthenticated = false
  app.locals.assetPath = config.AssetPath
  app.locals.bodyClasses = ''
  app.locals.formatPageTitle = formatPageTitle
  app.locals.govukRoot = 'https://gov.uk'
  app.locals.govukTemplateAssetPath = `${config.AssetPath}govuk_template/`
  app.locals.headerClass = 'with-proposition no-print'
  app.locals.htmlLang = 'en'
  app.locals.skipLinkMessage = null
  app.locals.homepageUrl = '/'
  app.locals.logoLinkTitle = 'Go to the home page'
  app.locals.globalHeaderText = 'GOV.UK'
  app.locals.crownCopyrightMessage = null
  app.locals.googleTrackingId = config.GOOGLE_TRACKING_ID
  app.locals.appInsightsClientKey = config.Monitoring.ApplicationInsights.Key
  app.locals.assetsVersion = pjson.mtc['assets-version']
  app.locals.appBuildNumber = buildNumber
  app.locals.formatGdsDate = formatGdsDate
  app.locals.formatFullGdsDate = formatFullGdsDate
  app.locals.formatGdsDateAndTime = formatGdsDateAndTime
  app.locals.formatPupilHistoryDataAndTime = dateService.formatPupilHistoryDateAndTime
  app.locals.formatFullGdsDateAndTime = formatFullGdsDateAndTime
  app.locals.formatPinDate = dateService.formatPinDate
  app.locals.formatPinExpiryTime = dateService.formatPinExpiryTime
  app.locals.guidancePdf = 'https://www.gov.uk/government/collections/multiplication-tables-check'
  app.locals.roles = roles
  app.locals.isSubmitImpersonationUrl = false
  app.locals.isSubmitMetaRedirectUrl = false
  app.locals.metaRedirectUrl = null
  app.locals.waitTimeBeforeMetaRedirectInSeconds = null
  app.locals.pupilAppURL = config.PUPIL_APP_URL
}
