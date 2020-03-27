'use strict'

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
    const summaryData = {
      schoolName: 'School One',
      items: [{}]
    } // schoolSummaryService.getData(req.user.schoolId)
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
