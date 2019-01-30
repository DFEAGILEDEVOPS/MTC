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
  let checkWindowData
  let featureEligibilityData
  let schoolName = ''
  try {
    // Fetch set of flags to determine pin generation allowance on UI
    checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    featureEligibilityData = await schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
    schoolName = await schoolService.findSchoolByDfeNumber(req.user.School)
  } catch (error) {
    return next(error)
  }
  return res.render('school/school-home', {
    breadcrumbs: [ { 'name': 'School Home' } ],
    featureEligibilityData,
    schoolName
  })
}

module.exports = controller
