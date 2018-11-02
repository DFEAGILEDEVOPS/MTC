'use strict'

const schoolHomePinGenerationEligibilityPresenter = require('../helpers/school-home-pin-generation-eligibility-presenter')
const config = require('../config')
const schoolService = require('../services/school.service')
const moment = require('moment')
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
  const currentDate = moment.utc()
  const overridePinExpiry = config.OverridePinExpiry
  let pinGenerationEligibilityData
  let schoolName = ''
  try {
    pinGenerationEligibilityData = await schoolHomePinGenerationEligibilityPresenter.getEligibilityData()
    schoolName = await schoolService.findSchoolByDfeNumber(req.user.School)
  } catch (error) {
    return next(error)
  }
  return res.render('school/school-home', {
    breadcrumbs: [ { 'name': 'School Home' } ],
    currentDate,
    overridePinExpiry,
    pinGenerationEligibilityData,
    schoolName
  })
}

module.exports = monitor('school.controller', controller)
