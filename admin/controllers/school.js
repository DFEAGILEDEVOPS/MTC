'use strict'

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
  let pinGenerationEligibilityData
  let schoolName = ''
  try {
    // Fetch set of flags to determine pin generation allowance on UI
    pinGenerationEligibilityData = await schoolHomePinGenerationEligibilityPresenter.getPresentationData()
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
