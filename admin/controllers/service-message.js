'use strict'

import { ServiceMessageCodesService } from '../services/service-message/service-message.service'
const administrationMessageService = require('../services/administration-message.service')
const ValidationError = require('../lib/validation-error')
const serviceMessagePresenter = require('../helpers/service-message-presenter')
const logger = require('../services/log.service').getLogger()
const uuidValidator = require('../lib/validator/common/uuid-validator')

const controller = {
  /**
   * Renders manage service message overview page
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  getServiceMessage: async function getServiceMessage (req, res, next) {
    res.locals.pageTitle = 'Manage service message'
    req.breadcrumbs(res.locals.pageTitle)
    // Dont rely on the global filtered messages in res.locals. As they are filtered.
    const allServiceMessages = await administrationMessageService.getMessages()
    try {
      res.render('service-message/service-message-overview', {
        breadcrumbs: req.breadcrumbs(),
        allServiceMessages
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
    let areaCodes = []
    try {
      areaCodes = await ServiceMessageCodesService.getAreaCodes()
    } catch (error) {
      console.error('Error fetching message Area Codes from the DB: ', error)
    }
    res.render('service-message/service-message-form', {
      err: err || new ValidationError(),
      formData: req.body,
      breadcrumbs: req.breadcrumbs(),
      areaCodes
    })
  },

  /**
   * Submits service message data: handles create and update
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  postSubmitServiceMessage: async function postSubmitServiceMessage (req, res, next) {
    const requestData = req.body
    try {
      if (!Array.isArray(requestData.areaCode)) {
        requestData.areaCode = requestData.areaCode?.length > 0 ? [requestData.areaCode] : []
      }
      const result = await administrationMessageService.setMessage(requestData, req.user.id)
      if (result && result.hasError && result.hasError()) {
        if (requestData.urlSlug !== undefined) {
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
      const slug = req.params.slug
      const validationError = uuidValidator.validate(slug, 'slug')
      if (validationError && validationError.hasError && validationError.hasError()) {
        req.flash('info', validationError.get('slug'))
        res.redirect('/service-message/')
        return
      }
      await administrationMessageService.dropMessage(req.user.id, slug)
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
      const slug = req.params.slug
      const validationError = uuidValidator.validate(slug, 'slug')
      if (validationError && validationError.hasError && validationError.hasError()) {
        req.flash('info', validationError.get('slug'))
        res.redirect('/service-message/')
        return
      }
      const serviceMessageMarkdown = await administrationMessageService.fetchMessageBySlug(slug)
      if (serviceMessageMarkdown === undefined) {
        req.flash('info', 'No service message to edit')
        res.redirect('/service-message/')
        return
      }
      const areaCodes = await ServiceMessageCodesService.getAreaCodes()
      req.breadcrumbs('Manage service message', '/service-message')
      res.locals.pageTitle = 'Edit service message'
      req.breadcrumbs(res.locals.pageTitle)
      res.render('service-message/service-message-form', {
        err,
        areaCodes,
        formData: {
          serviceMessageTitle: serviceMessageMarkdown.title,
          serviceMessageContent: serviceMessageMarkdown.message,
          urlSlug: slug,
          borderColourCode: serviceMessageMarkdown.borderColourCode,
          areaCodes: serviceMessageMarkdown.areaCodes
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
