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
controller.getSchoolImpersonation = async (req, res, next, error = null) => {
  res.locals.pageTitle = 'MTC Helpdesk School Impersonation'
  try {
    res.locals.isSubmitImpersonationUrl = true
    res.render('helpdesk/school-impersonation', {
      formData: req.body,
      err: error || new ValidationError(),
      breadcrumbs: req.breadcrumbs()
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Add helpdesk school impersonation
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {Promise.<void>}
 */
controller.postAddSchoolImpersonation = async (req, res, next) => {
  const { dfeNumber } = req.body
  try {
    const validationError = await schoolImpersonationService.setSchoolImpersonation(req.user, dfeNumber)
    if (validationError && validationError.hasError && validationError.hasError()) {
      return controller.getSchoolImpersonation(req, res, next, validationError)
    }
    res.redirect('/school/school-home')
  } catch (error) {
    next(error)
  }
  return next()
}

/**
 * Remove helpdesk school impersonation
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {Promise.<void>}
 */
controller.postRemoveSchoolImpersonation = async (req, res, next) => {
  try {
    schoolImpersonationService.removeImpersonation(req.user)
    req.flash('info', 'School impersonation has been removed')
    res.redirect('/helpdesk/school-impersonation')
  } catch (error) {
    next(error)
  }
  return next()
}

module.exports = controller
