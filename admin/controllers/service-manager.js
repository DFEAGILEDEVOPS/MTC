'use strict'

const moment = require('moment')
const winston = require('winston')
const settingsErrorMessages = require('../lib/errors/settings')
const settingsValidator = require('../lib/validator/settings-validator')
const checkWindowValidator = require('../lib/validator/check-window-validator')
const checkWindowErrorMessages = require('../lib/errors/check-window')
const checkWindowService = require('../services/check-window.service')
const dateService = require('../services/date.service')
const checkWindowDataService = require('../services/data-access/check-window.data.service')
const sortingAttributesService = require('../services/sorting-attributes.service')
const config = require('../config')
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
    let settings
    const successfulPost = req.params.status || false
    try {
      const settingsRecord = await settingService.get() // settingDataService.sqlFindOne()
      if (settingsRecord) {
        settings = settingsRecord
      } else {
        settings = {
          'questionTimeLimit': config.QUESTION_TIME_LIMIT,
          'loadingTimeLimit': config.TIME_BETWEEN_QUESTIONS
        }
      }
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
    let settings

    const settingsRecord = await settingService.get()
    if (settingsRecord) {
      settings = settingsRecord
    } else {
      settings = {}
    }
    settings.questionTimeLimit = Math.round(req.body.questionTimeLimit * 100) / 100
    settings.loadingTimeLimit = Math.round(req.body.loadingTimeLimit * 100) / 100

    let validationError = await settingsValidator.validate(req)
    if (validationError.hasError()) {
      res.locals.pageTitle = 'Settings on pupil check'
      req.breadcrumbs(res.locals.pageTitle)
      return res.render('service-manager/check-settings', {
        settings: req.body,
        error: validationError.errors,
        errorMessage: settingsErrorMessages,
        breadcrumbs: req.breadcrumbs()
      })
    }

    try {
      await settingService.update(settings.loadingTimeLimit, settings.questionTimeLimit, req.user.id)
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
      breadcrumbs: req.breadcrumbs(),
      actionName: 'Create',
      urlActionName: 'add',
      currentYear: moment(Date.now()).format('YYYY'),
      adminIsDisabled: 0,
      checkStartIsDisabled: 0
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
  saveCheckWindows: async (req, res, next) => {
    let actionName = 'Create'
    let urlActionName = 'add'
    let checkWindow
    let validationError = await checkWindowValidator.validate(req)
    let currentYear = moment.utc(moment.now()).format('YYYY')
    let flashMessage = req.body[ 'checkWindowName' ] + ' has been created'
    let adminIsDisabled = req.body.adminIsDisabled
    let checkStartIsDisabled = req.body.checkStartIsDisabled

    if (req.body.checkWindowId !== '') {
      actionName = 'Edit'
      urlActionName = 'edit'
      flashMessage = 'Changes have been saved'
    }

    if (validationError.hasError()) {
      res.locals.pageTitle = actionName + ' check window'
      req.breadcrumbs(res.locals.pageTitle)

      if (!req.body[ 'adminStartDay' ] && !req.body[ 'adminStartMonth' ] && !req.body[ 'adminStartYear' ] && req.body[ 'existingAdminStartDate' ] && req.body[ 'adminIsDisabled' ] === '1') {
        req.body.adminStartDay = moment(req.body[ 'existingAdminStartDate' ]).format('D')
        req.body.adminStartMonth = moment(req.body[ 'existingAdminStartDate' ]).format('MM')
        req.body.adminStartYear = moment(req.body[ 'existingAdminStartDate' ]).format('YYYY')
      }

      if (!req.body[ 'checkStartDay' ] && !req.body[ 'checkStartMonth' ] && !req.body[ 'checkStartYear' ] && req.body[ 'existingCheckStartDate' ] && req.body[ 'checkStartIsDisabled' ] === '1') {
        req.body.checkStartDay = moment(req.body[ 'existingCheckStartDate' ]).format('D')
        req.body.checkStartMonth = moment(req.body[ 'existingCheckStartDate' ]).format('MM')
        req.body.checkStartYear = moment(req.body[ 'existingCheckStartDate' ]).format('YYYY')
      }

      return res.render('service-manager/check-windows-form', {
        action: urlActionName,
        checkWindowData: req.body,
        error: validationError.errors,
        errorMessage: checkWindowErrorMessages,
        currentYear,
        actionName,
        urlActionName,
        breadcrumbs: req.breadcrumbs(),
        adminIsDisabled,
        checkStartIsDisabled
      })
    }

    try {
      if (req.body.checkWindowId) {
        checkWindow = await checkWindowDataService.sqlFindOneById(req.body.checkWindowId)
      }
    } catch (error) {
      return next(error)
    }

    let insertNew = false

    if (typeof checkWindow === 'undefined') {
      insertNew = true
      checkWindow = {}
    }

    checkWindow.name = req.body[ 'checkWindowName' ]
    if (req.body[ 'adminStartDay' ] && req.body[ 'adminStartMonth' ] && req.body[ 'adminStartYear' ]) {
      checkWindow.adminStartDate = dateService.createLocalTimeFromDayMonthYear(req.body[ 'adminStartDay' ], req.body[ 'adminStartMonth' ], req.body[ 'adminStartYear' ])
    }
    if (req.body[ 'checkStartDay' ] && req.body[ 'checkStartMonth' ] && req.body[ 'checkStartYear' ]) {
      checkWindow.checkStartDate = dateService.createLocalTimeFromDayMonthYear(req.body[ 'checkStartDay' ], req.body[ 'checkStartMonth' ], req.body[ 'checkStartYear' ])
    }
    checkWindow.checkEndDate = dateService.createLocalTimeFromDayMonthYear(req.body[ 'checkEndDay' ], req.body[ 'checkEndMonth' ], req.body[ 'checkEndYear' ])
    // Ensure check end date time is set to the last minute of the particular day
    checkWindow.checkEndDate.set({ hour: 23, minute: 59, second: 59 })

    // Auditing? Question for BAs.

    try {
      if (insertNew) {
        await checkWindowDataService.sqlCreate(checkWindow)
      } else {
        await checkWindowDataService.sqlUpdate(checkWindow)
      }
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
    let checkWindow

    if (!req.params.checkWindowId) {
      return res.redirect('/service-manager/check-windows')
    }

    try {
      checkWindow = await checkWindowDataService.sqlFindOneById(req.params.checkWindowId)
    } catch (err) {
      return next(err)
    }

    if (checkWindow) {
      if (Date.parse(checkWindow.checkStartDate) < moment.now()) {
        req.flash('error', 'Deleting an active check window is not allowed.')
      } else {
        try {
          await checkWindowDataService.sqlDeleteCheckWindow(req.params.checkWindowId)
          req.flash('info', 'Check window deleted.')
        } catch (error) {
          req.flash('error', 'Error trying to delete check window.')
        }
      }
      return res.redirect('/service-manager/check-windows')
    }
  }
}

module.exports = controller
