'use strict'

const moment = require('moment-timezone')

const checkWindowV2Service = require('../services/check-window-v2.service')
const config = require('../config')
const pupilRegisterService = require('../services/pupil-register.service')
const schoolHomeFeatureEligibilityPresenter = require('../helpers/school-home-feature-eligibility-presenter')
const schoolImpersonationService = require('../services/school-impersonation.service')
const schoolService = require('../services/school.service')
const resultPageAvailabilityService = require('../services/results-page-availability.service')
const ValidationError = require('../lib/validation-error')

const controller = {}

/**
 * Renders the helpdesk school impersonation page
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @param {object} error
 * @returns {Promise.<void>}
 */
controller.getSchoolImpersonation = async (req, res, next, error = null) => {
  res.locals.pageTitle = 'MTC Helpdesk School Impersonation'
  schoolImpersonationService.removeImpersonation(req.user)
  try {
    res.render('helpdesk/school-impersonation', {
      formData: req.body,
      err: error || new ValidationError(),
      breadcrumbs: req.breadcrumbs()
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Submit helpdesk school impersonation
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {Promise.<void>}
 */
controller.postSchoolImpersonation = async (req, res, next) => {
  const { dfeNumber } = req.body
  try {
    const outcome = await schoolImpersonationService.validateImpersonationForm(req.user, dfeNumber)
    if (outcome.hasError && outcome.hasError()) {
      return controller.getSchoolImpersonation(req, res, next, outcome)
    }
    res.redirect('home')
  } catch (error) {
    next(error)
  }
  return next()
}

/**
 * Renders the helpdesk (role) landing page
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {Promise.<void>}
 */
controller.getSchoolLandingPage = async (req, res, next) => {
  res.locals.pageTitle = 'MTC Helpdesk Homepage'
  try {
    // Fetch set of flags to determine pin generation allowance on UI
    const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    const schoolName = await schoolService.findSchoolByDfeNumber(req.user.School)
    const featureEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData, req.user.timezone)
    const currentDate = moment.tz(req.user.timezone || config.DEFAULT_TIMEZONE)
    const resultsOpeningDay = resultPageAvailabilityService.getResultsOpeningDate(currentDate, checkWindowData.checkEndDate)
    const isResultsFeatureAccessible = resultPageAvailabilityService.isResultsFeatureAccessible(currentDate, resultsOpeningDay)
    const hasIncompleteChecks = await pupilRegisterService.hasIncompleteChecks(req.user.schoolId)
    return res.render('school/school-home', {
      breadcrumbs: [ { 'name': 'School Home' } ],
      featureEligibilityData,
      hasIncompleteChecks,
      isResultsFeatureAccessible,
      schoolName
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = controller
