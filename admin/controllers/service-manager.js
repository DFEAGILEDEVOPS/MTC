'use strict'

const moment = require('moment')
const winston = require('winston')
const toBool = require('to-bool')
const settingsErrorMessages = require('../lib/errors/settings')
const settingsValidator = require('../lib/validator/settings-validator')
const checkWindowValidator = require('../lib/validator/check-window-validator')
const checkWindowErrorMessages = require('../lib/errors/check-window')
const checkWindowService = require('../services/check-window.service')
const checkWindowDataService = require('../services/data-access/check-window.data.service')
const sortingAttributesService = require('../services/sorting-attributes.service')
const settingService = require('../services/setting.service')

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
   * @param next
   * @returns {Promise.<void>}
   */
  checkWindowsForm: async (req, res, next) => {
    let error = ''
    let errorMessage = ''
    let checkWindowData = ''
    let successfulPost = false
    let actionName = (req.params.action === 'add' && req.params.id === undefined) ? 'Create' : 'Edit'
    let urlActionName = req.params.action
    let currentYear = moment.utc(Date.now()).format('YYYY')
    let adminIsDisabled = 0
    let checkStartIsDisabled = 0

    req.breadcrumbs('Manage check windows', '/service-manager/check-windows')
    res.locals.pageTitle = actionName + ' check window'
    req.breadcrumbs(res.locals.pageTitle)

    if (req.params.id !== undefined) {
      try {
        checkWindowData = await checkWindowDataService.sqlFindOneById(req.params.id)

        const adminStartDate = moment(checkWindowData.adminStartDate, 'D MM YYYY').format('YYYY-MM-D')
        const checkStartDate = moment(checkWindowData.checkStartDate, 'D MM YYYY').format('YYYY-MM-D')

        checkWindowData = {
          checkWindowId: req.params.id,
          checkWindowName: checkWindowData.name,
          adminStartDay: moment(checkWindowData.adminStartDate).format('D'),
          adminStartMonth: moment(checkWindowData.adminStartDate).format('MM'),
          adminStartYear: moment(checkWindowData.adminStartDate).format('YYYY'),
          checkStartDay: moment(checkWindowData.checkStartDate).format('D'),
          checkStartMonth: moment(checkWindowData.checkStartDate).format('MM'),
          checkStartYear: moment(checkWindowData.checkStartDate).format('YYYY'),
          checkEndDay: moment(checkWindowData.checkEndDate).format('D'),
          checkEndMonth: moment(checkWindowData.checkEndDate).format('MM'),
          checkEndYear: moment(checkWindowData.checkEndDate).format('YYYY'),
          existingAdminStartDate: adminStartDate,
          existingCheckStartDate: checkStartDate
        }

        const currentDate = moment.utc(moment.now()).format('YYYY-MM-D')
        if (moment(currentDate).isAfter(adminStartDate)) {
          adminIsDisabled = 1
        }
        if (moment(currentDate).isAfter(checkStartDate)) {
          checkStartIsDisabled = 1
        }
      } catch (error) {
        return next()
      }
    }

    res.render('service-manager/check-windows-form', {
      breadcrumbs: req.breadcrumbs(),
      error,
      errorMessage,
      checkWindowData,
      successfulPost,
      actionName,
      urlActionName,
      currentYear,
      adminIsDisabled,
      checkStartIsDisabled
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
      winston.error('Could not save check windows data.', error)
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
      next(error)
    }
    const { type, message } = result
    req.flash(type, message)
    return res.redirect('/service-manager/check-windows')
  }
}

module.exports = controller
