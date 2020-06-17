'use strict'

const ValidationError = require('../lib/validation-error')
const uuidValidator = require('../lib/validator/common/uuid-validator')
const checkDiagnosticsService = require('../services/check-diagnostic.service')
const payloadService = require('../services/payload.service')

const controller = {
/**
 * Renders the tech support landing page
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {Promise<void>}
 */
  getHomePage: async function getHomePage (req, res, next) {
    res.locals.pageTitle = 'Tech Support Homepage'
    try {
      return res.render('tech-support/home', {
        breadcrumbs: req.breadcrumbs()
      })
    } catch (error) {
      return next(error)
    }
  },
  /**
 * Renders the check view input form
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {Promise<void>}
 */
  getCheckViewPage: async function getCheckViewPage (req, res, next, error = null) {
    res.locals.pageTitle = 'Tech Support Check View'
    req.breadcrumbs('Check View')
    try {
      return res.render('tech-support/check-view', {
        breadcrumbs: req.breadcrumbs(),
        formData: {},
        err: error || new ValidationError(),
        summary: undefined,
        found: undefined
      })
    } catch (error) {
      return next(error)
    }
  },
  /**
 * Renders check view summary
 * @param {object} req
 * @param {object} res
 * @param {object} next
 */
  postCheckViewPage: async function postCheckViewPage (req, res, next) {
    res.locals.pageTitle = 'Tech Support Check View'
    const { checkCode } = req.body
    try {
      const validationError = uuidValidator.validate(checkCode, 'checkCode')
      if (validationError && validationError.hasError && validationError.hasError()) {
        return controller.getCheckViewPage(req, res, next, validationError)
      }
      let found = false
      const checkSummary = await checkDiagnosticsService.getByCheckCode(checkCode)
      if (checkSummary) {
        found = true
      }
      req.breadcrumbs('Check View')
      res.render('tech-support/check-view', {
        breadcrumbs: req.breadcrumbs(),
        err: new ValidationError(),
        formData: {
          checkCode: checkCode
        },
        summary: checkSummary,
        found: found
      })
    } catch (error) {
      return next(error)
    }
  },
  /**
   * @description Renders received check payload
   * @param {object} req
   * @param {object} res
   * @param {object} next
   */
  getReceivedCheckPayload: async function getReceivedCheckPayload (req, res, next) {
    const checkCode = req.query.checkCode.trim()
    let payload
    try {
      payload = await payloadService.getPayload(checkCode)
      res.type('json')
      res.send(JSON.stringify(payload, null, '    '))
    } catch (error) {
      res.type('txt')
      res.send(`${error}`)
    }
  }
}

module.exports = controller
