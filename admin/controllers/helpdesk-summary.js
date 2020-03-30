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
      schoolName: '[School Name]',
      dfeNumber: req.user.School,
      register: {
        completed: 1,
        started: 3,
        notTaking: 5
      },
      LiveCheckSummary: [
        {
          Date: '7th June',
          PinsGenerated: 59,
          LoggedIn: 58,
          StartedCheck: 44
        },
        {
          Date: '14th May',
          PinsGenerated: 59,
          LoggedIn: 58,
          StartedCheck: 44
        },
        {
          Date: '3rd May',
          PinsGenerated: 59,
          LoggedIn: 58,
          StartedCheck: 44
        }],
      TioCheckSummary: []
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
