'use strict'

const ValidationError = require('../lib/validation-error')
const uuidValidator = require('../lib/validator/common/uuid-validator')
const checkDiagnosticsService = require('../services/check-diagnostic.service')

const controller = {}

/**
 * Renders the tech support landing page
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {Promise<void>}
 */
controller.getHomePage = async (req, res, next) => {
  res.locals.pageTitle = 'Tech Support Homepage'
  try {
    return res.render('tech-support/home', {
      breadcrumbs: req.breadcrumbs()
    })
  } catch (error) {
    return next(error)
  }
}

/**
 * Renders the check view input form
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {Promise<void>}
 */
controller.getCheckViewPage = async (req, res, next, error = null) => {
  res.locals.pageTitle = 'Tech Support Check View'
  req.breadcrumbs('Check View')
  try {
    return res.render('tech-support/check-view', {
      breadcrumbs: req.breadcrumbs(),
      formData: {},
      err: error || new ValidationError(),
      summary: undefined,
      notFound: false
    })
  } catch (error) {
    return next(error)
  }
}

/**
 * Renders check view summary
 * @param {object} req
 * @param {object} res
 * @param {object} next
 */
controller.postCheckViewPage = async (req, res, next) => {
  res.locals.pageTitle = 'Tech Support Check View'
  const { checkCode } = req.body
  try {
    const validationError = uuidValidator.validate(checkCode, 'checkCode')
    if (validationError && validationError.hasError && validationError.hasError()) {
      return controller.getCheckViewPage(req, res, next, validationError)
    }
    let notFound = false
    const checkSummary = await checkDiagnosticsService.getByCheckCode(checkCode)
    if (!checkSummary) {
      notFound = true
    }
    res.render('tech-support/check-view', {
      breadcrumbs: req.breadcrumbs(),
      err: new ValidationError(),
      formData: {
        checkCode: checkCode
      },
      summary: checkSummary,
      notFound: notFound
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = controller
