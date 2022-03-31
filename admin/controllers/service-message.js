'use strict'

const administrationMessageService = require('../services/administration-message.service')
const ValidationError = require('../lib/validation-error')

const serviceMessagePresenter = require('../helpers/service-message-presenter')
const logger = require('../services/log.service').getLogger()

const controller = {

  /**
   * Renders manage service message page
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  getServiceMessage: async function getServiceMessage (req, res, next) {
    res.locals.pageTitle = 'Manage service message'
    req.breadcrumbs(res.locals.pageTitle)
    let serviceMessage
    try {
      serviceMessage = await administrationMessageService.getMessage()
      res.render('service-message/service-message-overview', {
        breadcrumbs: req.breadcrumbs(),
        serviceMessage
      })
    } catch (error) {
      return next(error)
    }
  },

  /**
   * Renders submit service message page
   * @param req
   * @param res
   * @param next
   * @param err
   * @returns {Promise.<void>}
   */
  getServiceMessageForm: async function getServiceMessageForm (req, res, next, err = undefined) {
    req.breadcrumbs('Manage service message', '/service-message')
    res.locals.pageTitle = 'Create service message'
    req.breadcrumbs(res.locals.pageTitle)
    res.render('service-message/service-message-form', {
      err: err || new ValidationError(),
      formData: req.body,
      breadcrumbs: req.breadcrumbs()
    })
  },

  /**
   * Submits service message data
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  postSubmitServiceMessage: async function postSubmitServiceMessage (req, res, next) {
    const requestData = req.body
    try {
      const result = await administrationMessageService.setMessage(requestData, req.user.id)
      if (result && result.hasError && result.hasError()) {
        if (requestData.id !== undefined) {
          return controller.getEditServiceMessage(req, res, next, result)
        } else {
          return controller.getServiceMessageForm(req, res, next, result)
        }
      }
      const flashMessage = serviceMessagePresenter.getFlashMessage()
      req.flash('info', flashMessage)
      return res.redirect('/service-message')
    } catch (error) {
      return next(error)
    }
  },

  /**
   * Removes service message
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  postRemoveServiceMessage: async function postRemoveServiceMessage (req, res, next) {
    try {
      await administrationMessageService.dropMessage(req.user.id)
      req.flash('info', 'Service message has successfully been removed')
      return res.redirect('/service-message')
    } catch (error) {
      return next(error)
    }
  },

  /**
   * Edit the service message
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  getEditServiceMessage: async function getEditServiceMessage (req, res, next, err = new ValidationError()) {
    try {
      const serviceMessageMarkdown = await administrationMessageService.fetchMessage()
      if (serviceMessageMarkdown === undefined) {
        req.flash('info', 'No service message to edit')
        res.redirect('/service-message/')
        return
      }
      req.breadcrumbs('Manage service message', '/service-message')
      res.locals.pageTitle = 'Edit service message'
      req.breadcrumbs(res.locals.pageTitle)
      res.render('service-message/service-message-form', {
        err: err,
        formData: {
          title: serviceMessageMarkdown.title,
          message: serviceMessageMarkdown.message,
          id: serviceMessageMarkdown.id,
          borderColourCode: serviceMessageMarkdown.borderColourCode
        },
        breadcrumbs: req.breadcrumbs()
      })
    } catch (error) {
      logger.error(`Edit Service Message: Error: ${error.message}`)
      return next(error)
    }
  }
}

module.exports = controller
