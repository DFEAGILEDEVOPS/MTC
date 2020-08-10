'use strict'

const schoolImpersonationService = require('../services/school-impersonation.service')
const ValidationError = require('../lib/validation-error')

const controller = {}

/**
 * Renders the helpdesk school impersonation page
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @param {object} error
 * @returns {Promise.<void>}
 */
controller.getSchoolImpersonation = async function getSchoolImpersonation (req, res, next, error = null) {
  res.locals.pageTitle = 'MTC Helpdesk School Impersonation'
  try {
    res.locals.isSubmitImpersonationUrl = true
    return res.render('helpdesk/school-impersonation', {
      formData: req.body,
      err: error || new ValidationError(),
      breadcrumbs: req.breadcrumbs()
    })
  } catch (error) {
    return next(error)
  }
}

/**
 * Add helpdesk school impersonation
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {Promise.<void>}
 */
controller.postAddSchoolImpersonation = async function postAddSchoolImpersonation (req, res, next) {
  const { dfeNumber } = req.body
  try {
    const validationError = await schoolImpersonationService.setSchoolImpersonation(req.user, dfeNumber)
    if (validationError && validationError.hasError && validationError.hasError()) {
      return controller.getSchoolImpersonation(req, res, next, validationError)
    }
    return res.redirect('/school/school-home')
  } catch (error) {
    return next(error)
  }
}

/**
 * Remove helpdesk school impersonation
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {Promise.<void>}
 */
controller.postRemoveSchoolImpersonation = async function postRemoveSchoolImpersonation (req, res, next) {
  try {
    schoolImpersonationService.removeImpersonation(req.user)
    req.flash('info', 'School impersonation has been removed')
    return res.redirect('/helpdesk/school-impersonation')
  } catch (error) {
    return next(error)
  }
}

module.exports = controller
