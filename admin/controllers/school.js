'use strict'

const checkWindowV2Service = require('../services/check-window-v2.service')
const schoolHomePinGenerationEligibilityPresenter = require('../helpers/school-home-pin-generation-eligibility-presenter')
const schoolService = require('../services/school.service')
const monitor = require('../helpers/monitor')
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
  let pinGenerationEligibilityData
  let schoolName = ''
  try {
    // Fetch set of flags to determine pin generation allowance on UI
    checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    pinGenerationEligibilityData = await schoolHomePinGenerationEligibilityPresenter.getPresentationData(checkWindowData)
    schoolName = await schoolService.findSchoolByDfeNumber(req.user.School)
  } catch (error) {
    return next(error)
  }
  return res.render('school/school-home', {
    breadcrumbs: [ { 'name': 'School Home' } ],
    pinGenerationEligibilityData,
    schoolName
  })
}

module.exports = monitor('school.controller', controller)
