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

/**
 * Returns the service-manager (role) landing page
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
const getServiceManagerHome = async (req, res, next) => {
  res.locals.pageTitle = 'MTC Administration Homepage'

  try {
    req.breadcrumbs(res.locals.pageTitle)
    res.render('service-manager/service-manager-home', {
      breadcrumbs: req.breadcrumbs()
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get custom time settings.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
const getUpdateTiming = async (req, res, next) => {
  res.locals.pageTitle = 'Check settings'
  let settings
  const successfulPost = req.params.status || false
  console.log('session:', req.session)
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
}

/**
 * Update time settings in DB.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
const setUpdateTiming = async (req, res, next) => {
  res.locals.pageTitle = 'Check settings'
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
    res.locals.pageTitle = 'Check settings'
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
}

/**
 * View manage check windows.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
const getCheckWindows = async (req, res, next) => {
  res.locals.pageTitle = 'Manage check windows'
  req.breadcrumbs(res.locals.pageTitle)

  let checkWindows
  let checkWindowsFormatted = []
  let checkWindowsCurrent
  let checkWindowsPast

  // Sorting
  const sortingOptions = [
    { 'key': 'checkWindowName', 'value': 'asc' },
    { 'key': 'adminStartDate', 'value': 'asc' },
    { 'key': 'checkStartDate', 'value': 'asc' }
  ]
  const sortField = req.params.sortField === undefined ? 'checkWindowName' : req.params.sortField
  const sortDirection = req.params.sortDirection === undefined ? 'asc' : req.params.sortDirection
  const { htmlSortDirection, arrowSortDirection } = sortingAttributesService.getAttributes(sortingOptions, sortField, sortDirection)

  // Get current check windows
  try {
    checkWindows = await checkWindowDataService.sqlFindCurrent(sortField, sortDirection)
    checkWindowsCurrent = checkWindowService.formatCheckWindowDocuments(checkWindows, true, false)
  } catch (error) {
    return next(error)
  }

  // Get past check windows
  try {
    checkWindows = await checkWindowDataService.sqlFindPast(sortField, sortDirection)
    checkWindowsPast = checkWindowService.formatCheckWindowDocuments(checkWindows, false, false)
  } catch (error) {
    return next(error)
  }

  // @TODO: Better merge? Object.assign overrides elements.
  if (checkWindowsCurrent) {
    checkWindowsCurrent.forEach((chc, index) => {
      checkWindowsFormatted.push(chc)
    })
  }
  if (checkWindowsPast) {
    checkWindowsPast.forEach((chp, index) => {
      checkWindowsFormatted.push(chp)
    })
  }

  res.render('service-manager/check-windows', {
    breadcrumbs: req.breadcrumbs(),
    checkWindowList: checkWindowsFormatted,
    htmlSortDirection,
    arrowSortDirection
  })
}

/**
 * Add window check form.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
const checkWindowsForm = async (req, res, next) => {
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
}

/**
 * Save check windows (add/edit).
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
const saveCheckWindows = async (req, res, next) => {
  let actionName = 'Create'
  let urlActionName = 'add'
  let checkWindow
  let validationError = await checkWindowValidator.validate(req)
  let currentYear = moment.utc(moment.now()).format('YYYY')
  let flashMessage = req.body['checkWindowName'] + ' has been created'
  let adminIsDisabled = req.body.adminIsDisabled
  let checkStartIsDisabled = req.body.checkStartIsDisabled

  if (req.body.checkWindowId !== '') {
    actionName = 'Edit'
    urlActionName = 'edit'
    flashMessage = 'Changes have been saved'

    checkWindow = await checkWindowDataService.sqlFindOneById(req.body.checkWindowId)
  }

  if (validationError.hasError()) {
    res.locals.pageTitle = actionName + ' check window'
    req.breadcrumbs(res.locals.pageTitle)

    if (!req.body['adminStartDay'] && !req.body['adminStartMonth'] && !req.body['adminStartYear'] && req.body['existingAdminStartDate'] && req.body['adminIsDisabled'] === '1') {
      req.body.adminStartDay = moment(req.body['existingAdminStartDate']).format('D')
      req.body.adminStartMonth = moment(req.body['existingAdminStartDate']).format('MM')
      req.body.adminStartYear = moment(req.body['existingAdminStartDate']).format('YYYY')
    }

    if (!req.body['checkStartDay'] && !req.body['checkStartMonth'] && !req.body['checkStartYear'] && req.body['existingCheckStartDate'] && req.body['checkStartIsDisabled'] === '1') {
      req.body.checkStartDay = moment(req.body['existingCheckStartDate']).format('D')
      req.body.checkStartMonth = moment(req.body['existingCheckStartDate']).format('MM')
      req.body.checkStartYear = moment(req.body['existingCheckStartDate']).format('YYYY')
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

  if (typeof checkWindow === 'undefined') {
    checkWindow = {}
  }

  checkWindow.name = req.body['checkWindowName']
  if (req.body['adminStartDay'] && req.body['adminStartMonth'] && req.body['adminStartYear']) {
    checkWindow.adminStartDate = dateService.formatDateFromRequest(req.body, 'adminStartDay', 'adminStartMonth', 'adminStartYear')
  }
  if (req.body['checkStartDay'] && req.body['checkStartMonth'] && req.body['checkStartYear']) {
    checkWindow.checkStartDate = dateService.formatDateFromRequest(req.body, 'checkStartDay', 'checkStartMonth', 'checkStartYear')
  }
  checkWindow.checkEndDate = dateService.formatDateFromRequest(req.body, 'checkEndDay', 'checkEndMonth', 'checkEndYear')

  // Auditing? Question for BAs.

  try {
    await checkWindowDataService.sqlCreate(checkWindow)
    req.flash('info', flashMessage)
  } catch (error) {
    winston.info('Could not save check windows data.', error)
    return next(error)
  }

  return res.redirect('/service-manager/check-windows')
}

/**
 * Soft delete a check window by id.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
const removeCheckWindow = async (req, res, next) => {
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

module.exports = {
  getServiceManagerHome,
  getUpdateTiming,
  setUpdateTiming,
  getCheckWindows,
  checkWindowsForm,
  saveCheckWindows,
  removeCheckWindow
}
