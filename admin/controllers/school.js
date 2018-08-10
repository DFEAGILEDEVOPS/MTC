'use strict'

const schoolService = require('../services/school.service')
const monitor = require('../helpers/monitor')

/**
 * School landing page.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const getSchoolLandingPage = async (req, res, next) => {
  res.locals.pageTitle = 'School Homepage'
  let schoolName = ''

  try {
    schoolName = await schoolService.findSchoolByDfeNumber(req.user.School)
  } catch (error) {
    return next(error)
  }
  return res.render('school/school-home', {
    schoolName,
    breadcrumbs: [ { 'name': 'School Home' } ]
  })
}

module.exports = monitor('school.controller', { getSchoolLandingPage })
