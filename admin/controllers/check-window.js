'use strict'

const moment = require('moment')
const monitor = require('../helpers/monitor')
const checkWindowErrorMessages = require('../lib/errors/check-window-v2')
const checkWindowV2AddService = require('../services/check-window-v2-add.service')
const ValidationError = require('../lib/validation-error')

const controller = {

  /**
   * Returns check windows hub page
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  getManageCheckWindows: async (req, res, next) => {
    res.locals.pageTitle = 'Manage check windows'
    req.breadcrumbs(res.locals.pageTitle)
    return res.render('check-window/manage-check-windows', {
      breadcrumbs: req.breadcrumbs(),
      messages: res.locals.messages
    })
  },

  /**
   * Create new check window
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  createCheckWindow: async (req, res, next) => {
    res.locals.pageTitle = 'Create check window'
    req.breadcrumbs('Manage check windows', '/check-window/manage-check-windows')
    req.breadcrumbs(res.locals.pageTitle)
    return res.render('check-window/create-check-window', {
      checkWindowData: {},
      breadcrumbs: req.breadcrumbs(),
      error: new ValidationError(),
      currentYear: moment().format('YYYY')
    })
  },

  /**
   * Submit check window
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  submitCheckWindow: async (req, res, next) => {
    const requestData = req.body
    let flashMessage
    try {
      flashMessage = await checkWindowV2AddService.submit(requestData)
    } catch (error) {
      if (error.name === 'ValidationError') {
        res.locals.pageTitle = 'Create check window'
        return res.render('check-window/create-check-window', {
          error: error || new ValidationError(),
          errorMessage: checkWindowErrorMessages,
          breadcrumbs: req.breadcrumbs(),
          checkWindowData: requestData,
          successfulPost: false,
          currentYear: moment().format('YYYY')
        })
      }
      return next(error)
    }
    req.flash('info', flashMessage)
    return res.redirect('/check-window/manage-check-windows')
  }
}

module.exports = monitor('service-manager.controller', controller)
