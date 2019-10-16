'use strict'

const administrationMessageService = require('../services/administration-message.service')
const ValidationError = require('../lib/validation-error')

const serviceMessagePresenter = require('../helpers/service-message-presenter')

const controller = {

  /**
   * Renders manage service message page
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  getServiceMessage: async (req, res, next) => {
    res.locals.pageTitle = 'Manage service message'
    req.breadcrumbs(res.locals.pageTitle)
    let serviceMessage
    try {
      serviceMessage = await administrationMessageService.getMessage()
    } catch (error) {
      return next(error)
    }
    res.render('service-message/service-message-overview', {
      breadcrumbs: req.breadcrumbs(),
      serviceMessage
    })
  },

  /**
   * Renders submit service message page
   * @param req
   * @param res
   * @param next
   * @param err
   * @returns {Promise.<void>}
   */
  getServiceMessageForm: async (req, res, next, err = undefined) => {
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
  postSubmitServiceMessage: async (req, res, next) => {
    const requestData = req.body
    try {
      const result = await administrationMessageService.setMessage(requestData, req.user.id)
      if (result && result.hasError && result.hasError()) {
        return controller.getServiceMessageForm(req, res, next, result)
      }
      const flashMessage = serviceMessagePresenter.getFlashMessage(requestData)
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
  postRemoveServiceMessage: async (req, res, next) => {
    try {
      await administrationMessageService.dropMessage(req.user.id)
      req.flash('info', 'Service message has been successfully removed')
      return res.redirect('/service-message')
    } catch (error) {
      return next(error)
    }
  }
}

module.exports = controller
