'use strict'

const checkWindowV2Service = require('../services/check-window-v2.service')
const schoolHomeFeatureEligibilityPresenter = require('../helpers/school-home-feature-eligibility-presenter')
const schoolService = require('../services/school.service')
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
    // Fetch set of flags to determine pin generation allowance on UI
    const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    const schoolName = await schoolService.findSchoolByDfeNumber(req.user.School)
    const featureEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
    return res.render('school/school-home', {
      breadcrumbs: [ { 'name': 'School Home' } ],
      featureEligibilityData,
      schoolName
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = controller
