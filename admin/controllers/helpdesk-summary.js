'use strict'

const schoolSummaryService = require('../services/school-summary.service')

const controller = {}

/**
 * Renders the helpdesk school summary page
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {Promise.<void>}
 */
controller.getSummary = async (req, res, next) => {
  res.locals.pageTitle = 'School Summary'
  try {
    const summaryData = await schoolSummaryService.getSummary(req.user.schoolId)
    req.breadcrumbs(res.locals.pageTitle)
    return res.render('helpdesk/school-summary', {
      breadcrumbs: req.breadcrumbs(),
      summary: summaryData
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = controller
