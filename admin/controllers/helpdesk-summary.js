'use strict'

const ValidationError = require('../lib/validation-error')
const controller = {}

/**
 * Renders the helpdesk school summary page
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @param {object} error
 * @returns {Promise.<void>}
 */
controller.getSummary = async (req, res, next, error = null) => {
  res.locals.pageTitle = 'MTC Helpdesk School Summary'
  try {
    return res.render('helpdesk/school-summary', {
      formData: req.body,
      err: error || new ValidationError(),
      breadcrumbs: req.breadcrumbs()
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = controller
