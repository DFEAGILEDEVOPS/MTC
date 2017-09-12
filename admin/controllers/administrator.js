const Settings = require('../models/setting')
const CheckWindow = require('../models/check-window')
const SettingsLog = require('../models/setting-log')
const settingsErrorMessages = require('../lib/errors/settings')
const settingsValidator = require('../lib/validator/settings-validator')
const config = require('../config')

/**
 * Returns the administrator (role) landing page
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
const getAdministration = async (req, res, next) => {
  res.locals.pageTitle = 'MTC Administration Homepage'

  try {
    req.breadcrumbs(res.locals.pageTitle)
    res.render('administrator/administration-home', {
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

  try {
    const settingsRecord = await Settings.findOne().exec()
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
    res.render('administrator/check-settings', {
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

  const settingsRecord = await Settings.findOne().exec()
  if (settingsRecord) {
    settings = settingsRecord
  } else {
    settings = new Settings()
  }
  settings.questionTimeLimit = Math.round(req.body.questionTimeLimit * 100) / 100
  settings.loadingTimeLimit = Math.round(req.body.loadingTimeLimit * 100) / 100

  let validationError = await settingsValidator.validate(req)
  if (validationError.hasError()) {
    res.locals.pageTitle = 'Check settings'
    req.breadcrumbs(res.locals.pageTitle)
    return res.render('administrator/check-settings', {
      settings: req.body,
      error: validationError.errors,
      errorMessage: settingsErrorMessages,
      breadcrumbs: req.breadcrumbs()
    })
  }

  try {
    await settings.save()
    let settingsLog = new SettingsLog()

    settingsLog.adminSession = req.session.id
    settingsLog.emailAddress = ((res.locals).user || {}).EmailAddress
    settingsLog.userName = ((res.locals).user || {}).UserName
    settingsLog.questionTimeLimit = settings.questionTimeLimit
    settingsLog.loadingTimeLimit = settings.loadingTimeLimit

    try {
      await settingsLog.save()
    } catch (error) {
      console.log('Could not save setting log.')
    }
  } catch (error) {
    return next(error)
  }
  return res.redirect('/administrator/check-settings/updated')
}

/**
 * View manage check windows.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
const getCheckWindows = async (req, res, next) => {
  res.locals.pageTitle = 'Check settings'
  req.breadcrumbs(res.locals.pageTitle)

  let checkWindows
  try {
    checkWindows = await CheckWindow.getCheckWindows()
  } catch (error) {
    return next(error)
  }

  console.log('checkWindows', checkWindows)
  res.render('administrator/check-windows', {
    breadcrumbs: req.breadcrumbs(),
    checkWindowList: checkWindows
  })
}

module.exports = {
  getAdministration,
  getUpdateTiming,
  setUpdateTiming,
  getCheckWindows
}
