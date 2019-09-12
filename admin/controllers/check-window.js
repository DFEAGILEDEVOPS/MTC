'use strict'

const moment = require('moment')

const checkWindowErrorMessages = require('../lib/errors/check-window-v2')
const checkWindowPresenter = require('../helpers/check-window-presenter')
const checkWindowV2AddService = require('../services/check-window-v2-add.service')
const checkWindowV2UpdateService = require('../services/check-window-v2-update.service')
const checkWindowV2Service = require('../services/check-window-v2.service')
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
    let checkWindows
    try {
      checkWindows = await checkWindowV2Service.getCheckWindows()
    } catch (error) {
      return next(error)
    }
    return res.render('check-window/manage-check-windows', {
      layout: 'gds-layout',
      breadcrumbs: req.breadcrumbs(),
      messages: res.locals.messages,
      checkWindows
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
      layout: 'gds-layout',
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
    const { checkWindowUrlSlug } = requestData
    let flashMessage
    try {
      if (checkWindowUrlSlug) {
        await checkWindowV2UpdateService.submit(requestData)
        const checkWindow = await checkWindowV2Service.getCheckWindow(checkWindowUrlSlug)
        flashMessage = `${checkWindow.name} has been edited`
      } else {
        await checkWindowV2AddService.submit(requestData)
        flashMessage = `${requestData.checkWindowName} has been created`
      }
    } catch (error) {
      if (error.name === 'ValidationError') {
        res.locals.pageTitle = checkWindowUrlSlug ? 'Edit check window' : 'Create check window'
        let checkWindowViewData = requestData
        if (checkWindowUrlSlug) {
          const checkWindowData = await checkWindowV2Service.getCheckWindow(checkWindowUrlSlug)
          checkWindowViewData = checkWindowPresenter.getViewModelData(checkWindowData, requestData)
        }
        return res.render('check-window/create-check-window', {
          layout: 'gds-layout',
          error: error || new ValidationError(),
          errorMessage: checkWindowErrorMessages,
          breadcrumbs: req.breadcrumbs(),
          checkWindowData: checkWindowViewData,
          currentYear: moment().format('YYYY')
        })
      }
      return next(error)
    }
    req.flash('info', flashMessage)
    return res.redirect('/check-window/manage-check-windows')
  },

  /**
   * Soft delete a check window
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<*>}
   */
  removeCheckWindow: async (req, res, next) => {
    const urlSlug = req.params.checkWindowUrlSlug
    let checkWindow
    try {
      checkWindow = await checkWindowV2Service.getCheckWindow(urlSlug)
      await checkWindowV2Service.markDeleted(urlSlug)
    } catch (error) {
      return next(error)
    }
    req.flash('info', `${checkWindow['name']} has been successfully removed`)
    return res.redirect('/check-window/manage-check-windows')
  },

  /**
   * Edit check window form.
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */

  getCheckWindowEditForm: async (req, res, next) => {
    req.breadcrumbs('Manage check windows', '/check-window/manage-check-windows')
    res.locals.pageTitle = 'Edit check window'
    req.breadcrumbs(res.locals.pageTitle)
    let checkWindowData
    let checkWindowViewData
    try {
      checkWindowData = await checkWindowV2Service.getCheckWindow(req.params.checkWindowUrlSlug)
      checkWindowViewData = checkWindowPresenter.getViewModelData(checkWindowData)
    } catch (error) {
      return next(error)
    }
    return res.render('check-window/create-check-window', {
      layout: 'gds-layout',
      error: new ValidationError(),
      errorMessage: checkWindowErrorMessages,
      breadcrumbs: req.breadcrumbs(),
      checkWindowData: checkWindowViewData,
      currentYear: moment().format('YYYY')
    })
  }
}

module.exports = controller
