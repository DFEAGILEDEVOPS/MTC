'use strict'

const moment = require('moment')
const toBool = require('to-bool')
const settingsErrorMessages = require('../lib/errors/settings')
const settingsValidator = require('../lib/validator/settings-validator')
const checkWindowValidator = require('../lib/validator/check-window-validator')
const checkWindowErrorMessages = require('../lib/errors/check-window')
const checkWindowService = require('../services/check-window.service')
const sortingAttributesService = require('../services/sorting-attributes.service')
const settingService = require('../services/setting.service')
const ValidationError = require('../lib/validation-error')

const controller = {

  /**
   * Returns the service-manager (role) landing page
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  getServiceManagerHome: async (req, res, next) => {
    res.locals.pageTitle = 'MTC Administration Homepage'

    try {
      req.breadcrumbs(res.locals.pageTitle)
      res.render('service-manager/service-manager-home', {
        breadcrumbs: req.breadcrumbs()
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Get custom time settings.
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<*>}
   */
  getUpdateTiming: async (req, res, next) => {
    res.locals.pageTitle = 'Settings on pupil check'
    const successfulPost = req.params.status || false
    let settings
    try {
      settings = await settingService.get()
    } catch (error) {
      return next(error)
    }

    try {
      req.breadcrumbs(res.locals.pageTitle)
      res.render('service-manager/check-settings', {
        settings,
        successfulPost,
        error: new ValidationError(),
        breadcrumbs: req.breadcrumbs()
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Update time settings in DB.
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<*>}
   */
  setUpdateTiming: async (req, res, next) => {
    res.locals.pageTitle = 'Settings on pupil check'
    try {
      const getValidationResult = req.getValidationResult
      const checkBody = req.checkBody
      const validationError = await settingsValidator.validate(checkBody, getValidationResult)
      if (validationError.hasError()) {
        res.locals.pageTitle = 'Settings on pupil check'
        req.breadcrumbs(res.locals.pageTitle)
        return res.render('service-manager/check-settings', {
          settings: req.body,
          error: validationError,
          errorMessage: settingsErrorMessages,
          breadcrumbs: req.breadcrumbs()
        })
      }
      await settingService.update(req.body.loadingTimeLimit, req.body.questionTimeLimit, req.user.id)
    } catch (error) {
      return next(error)
    }
    return res.redirect('/service-manager/check-settings/updated')
  },

  /**
   * View manage check windows.
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  getCheckWindows: async (req, res, next) => {
    res.locals.pageTitle = 'Manage check windows'
    req.breadcrumbs(res.locals.pageTitle)
    let checkWindows
    // Sorting
    const sortingOptions = [
      { 'key': 'checkWindowName', 'value': 'asc' },
      { 'key': 'adminStartDate', 'value': 'asc' },
      { 'key': 'checkStartDate', 'value': 'asc' }
    ]
    const sortField = req.params.sortField === undefined ? 'checkWindowName' : req.params.sortField
    const sortDirection = req.params.sortDirection === undefined ? 'asc' : req.params.sortDirection
    const { htmlSortDirection, arrowSortDirection } = sortingAttributesService.getAttributes(sortingOptions, sortField, sortDirection)

    // Get all check windows
    try {
      checkWindows = await checkWindowService.getAllCheckWindows(sortField, sortDirection)
    } catch (error) {
      return next(error)
    }

    res.render('service-manager/check-windows', {
      breadcrumbs: req.breadcrumbs(),
      checkWindowList: checkWindows,
      htmlSortDirection,
      arrowSortDirection
    })
  },

  /**
   * Add window check form.
   * @param req
   * @param res
   * @returns {Promise.<void>}
   */

  getCheckWindowForm: async (req, res) => {
    req.breadcrumbs('Manage check windows', '/service-manager/check-windows')
    res.locals.pageTitle = 'Create check window'
    res.render('service-manager/check-windows-form', {
      checkWindowData: {},
      error: new ValidationError(),
      breadcrumbs: req.breadcrumbs(),
      actionName: 'Create',
      urlActionName: 'add',
      currentYear: moment().format('YYYY'),
      adminIsDisabled: false,
      checkStartIsDisabled: false
    })
  },

  /**
   * Edit window check form.
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */

  getEditableCheckWindowForm: async (req, res, next) => {
    req.breadcrumbs('Manage check windows', '/service-manager/check-windows')
    res.locals.pageTitle = 'Edit check window'
    let checkWindowData
    try {
      checkWindowData = await checkWindowService.getEditableCheckWindow(req.params.id)
    } catch (error) {
      return next()
    }
    res.render('service-manager/check-windows-form', {
      error: new ValidationError(),
      breadcrumbs: req.breadcrumbs(),
      checkWindowData,
      successfulPost: false,
      actionName: 'Create',
      urlActionName: 'add',
      currentYear: moment(Date.now()).format('YYYY'),
      adminIsDisabled: checkWindowData.adminIsDisabled,
      checkStartIsDisabled: checkWindowData.checkStartIsDisabled
    })
  },

  /**
   * Save check windows (add/edit).
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  saveCheckWindow: async (req, res, next) => {
    const requestData = req.body
    const getValidationResult = req.getValidationResult
    const checkBody = req.checkBody
    try {
      const validationError = await checkWindowValidator.validate(requestData, checkBody, getValidationResult)
      const actionName = requestData.checkWindowId ? 'Edit' : 'Add'
      const flashMessage = requestData.checkWindowId !== ''
        ? 'Changes have been saved' : requestData[ 'checkWindowName' ] + ' has been created'
      let adminIsDisabled = toBool(requestData.adminIsDisabled)
      let checkStartIsDisabled = toBool(requestData.checkStartIsDisabled)

      if (validationError.hasError()) {
        res.locals.pageTitle = actionName + ' check window'
        req.breadcrumbs(res.locals.pageTitle)
        const checkWindowData = checkWindowService.formatUnsavedData(requestData)
        return res.render('service-manager/check-windows-form', {
          checkWindowData: checkWindowData,
          error: validationError,
          errorMessage: checkWindowErrorMessages,
          currentYear: moment().format('YYYY'),
          actionName,
          breadcrumbs: req.breadcrumbs(),
          adminIsDisabled,
          checkStartIsDisabled
        })
      }
      await checkWindowService.save(requestData)
      req.flash('info', flashMessage)
    } catch (error) {
      return next(error)
    }
    return res.redirect('/service-manager/check-windows')
  },

  /**
   * Soft delete a check window by id.
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<*>}
   */
  removeCheckWindow: async (req, res, next) => {
    if (!req.params.checkWindowId) {
      return res.redirect('/service-manager/check-windows')
    }
    let result
    try {
      result = await checkWindowService.markDeleted(req.params.checkWindowId)
    } catch (error) {
      return next(error)
    }
    const { type, message } = result
    req.flash(type, message)
    return res.redirect('/service-manager/check-windows')
  }
}

module.exports = controller
