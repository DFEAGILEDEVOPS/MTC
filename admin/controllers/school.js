'use strict'

const moment = require('moment-timezone')

const checkWindowV2Service = require('../services/check-window-v2.service')
const config = require('../config')
const featureToggles = require('feature-toggles')
const helpdeskService = require('../services/helpdesk.service')
const schoolHomeFeatureEligibilityPresenter = require('../helpers/school-home-feature-eligibility-presenter')
const schoolService = require('../services/school.service')
const resultPageAvailabilityService = require('../services/results-page-availability.service')
const administrationMessageService = require('../services/administration-message.service')
const controller = {}

/**
 * Display school landing page.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
controller.getSchoolLandingPage = async (req, res, next) => {
  res.locals.pageTitle = 'School Homepage'
  try {
    const isHelpdeskRole = helpdeskService.isHelpdeskRole(req.user)
    const isImpersonating = helpdeskService.isImpersonating(req.user)
    // Prevent helpdesk users from accessing school home when impersonation data are not populated
    if (isHelpdeskRole && !isImpersonating) {
      return res.redirect('/helpdesk/school-impersonation')
    }
    // Fetch set of flags to determine pin generation allowance on UI
    const checkWindowData = await checkWindowV2Service.getActiveCheckWindow(true)
    const schoolName = await schoolService.findSchoolByDfeNumber(req.user.School)
    const featureEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData, req.user.timezone)
    const currentDate = moment.tz(req.user.timezone || config.DEFAULT_TIMEZONE)
    const resultsOpeningDay = resultPageAvailabilityService.getResultsOpeningDate(currentDate, checkWindowData.checkEndDate)
    const isResultsFeatureAccessible = resultPageAvailabilityService.isResultsFeatureAccessible(currentDate, resultsOpeningDay)
    const serviceMessage = await administrationMessageService.getMessage()
    const schoolHomeView = featureToggles.isFeatureEnabled('schoolHomeViewV2')
      ? 'school/school-home-v2' : 'school/school-home'
    return res.render(schoolHomeView, {
      breadcrumbs: [{ name: 'School Home' }],
      featureEligibilityData,
      isResultsFeatureAccessible,
      schoolName,
      serviceMessage
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = controller
