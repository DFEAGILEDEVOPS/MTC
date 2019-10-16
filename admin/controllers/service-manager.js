'use strict'

const moment = require('moment-timezone')
const settingsErrorMessages = require('../lib/errors/settings')
const settingsValidator = require('../lib/validator/settings-validator')
const checkWindowErrorMessages = require('../lib/errors/check-window')
const checkWindowService = require('../services/check-window.service')
const sortingAttributesService = require('../services/sorting-attributes.service')
const settingService = require('../services/setting.service')
const pupilCensusService = require('../services/pupil-census.service')
const checkWindowAddService = require('../services/check-window-add.service')
const checkWindowEditService = require('../services/check-window-edit.service')
const sceService = require('../services/sce.service')
const sceSchoolValidator = require('../lib/validator/sce-school-validator')
const uploadedFileService = require('../services/uploaded-file.service')
const ValidationError = require('../lib/validation-error')
const scePresenter = require('../helpers/sce')

const featureToggles = require('feature-toggles')

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
    const isNewCheckWindow = featureToggles.isFeatureEnabled('newCheckWindow')
    try {
      req.breadcrumbs(res.locals.pageTitle)
      res.render('service-manager/service-manager-home', {
        breadcrumbs: req.breadcrumbs(),
        isNewCheckWindow
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
      const validationError = await settingsValidator.validate(req.body)
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
      await settingService.update(req.body.loadingTimeLimit, req.body.questionTimeLimit, req.body.checkTimeLimit, req.user.id)
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
      { key: 'checkWindowName', value: 'asc' },
      { key: 'adminStartDate', value: 'asc' },
      { key: 'checkStartDate', value: 'asc' }
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
   * View upload pupil census.
   * @param req
   * @param res
   * @param next
   * @param error
   * @returns {Promise.<void>}
   */
  getUploadPupilCensus: async (req, res, next, error = null) => {
    res.locals.pageTitle = 'Upload pupil census'
    req.breadcrumbs(res.locals.pageTitle)
    let pupilCensus
    let templateFileSize
    try {
      const templateFile = 'assets/csv/mtc-census-headers.csv'
      templateFileSize = uploadedFileService.getFilesize(templateFile)
      pupilCensus = await pupilCensusService.getUploadedFile()
    } catch (error) {
      return next(error)
    }
    res.render('service-manager/upload-pupil-census', {
      breadcrumbs: req.breadcrumbs(),
      messages: res.locals.messages,
      pupilCensus,
      templateFileSize,
      fileErrors: error || new ValidationError()
    })
  },

  /**
   * Submit pupil census.
   * @param req
   * @param res
   * @param next
   * @returns {Promise<*>}
   */
  postUploadPupilCensus: async (req, res, next) => {
    const uploadFile = req.files && req.files.csvPupilCensusFile
    try {
      const validationError = await pupilCensusService.process(uploadFile)
      if (validationError.hasError()) {
        return controller.getUploadPupilCensus(req, res, next, validationError)
      }
      await pupilCensusService.upload2(uploadFile)
    } catch (error) {
      return next(error)
    }
    req.flash('info', 'File has been uploaded')
    res.redirect('/service-manager/upload-pupil-census')
  },

  /**
   * Remove a pupil census record.
   * @param req
   * @param res
   * @param next
   * @returns {Promise<*>}
   */
  getRemovePupilCensus: async (req, res, next) => {
    const pupilCensusId = req.params && req.params.pupilCensusId
    try {
      await pupilCensusService.remove(pupilCensusId)
    } catch (error) {
      return next(error)
    }
    req.flash('info', 'Pupil data successfully removed')
    res.redirect('/service-manager/upload-pupil-census')
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
    res.render('service-manager/check-window-form', {
      checkWindowData: {},
      error: new ValidationError(),
      breadcrumbs: req.breadcrumbs(),
      actionName: 'Create',
      currentYear: moment().format('YYYY')
    })
  },

  /**
   * Edit check window form.
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */

  getCheckWindowEditForm: async (req, res, next) => {
    req.breadcrumbs('Manage check windows', '/service-manager/check-windows')
    res.locals.pageTitle = 'Edit check window'
    let checkWindowData
    try {
      checkWindowData = await checkWindowService.getCheckWindowEditForm(req.params.id)
    } catch (error) {
      return next(error)
    }
    res.render('service-manager/check-window-form', {
      error: new ValidationError(),
      breadcrumbs: req.breadcrumbs(),
      checkWindowData,
      successfulPost: false,
      actionName: 'Edit',
      currentYear: moment().format('YYYY')
    })
  },

  /**
   * Submit check window (add/edit).
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  submitCheckWindow: async (req, res, next) => {
    const requestData = req.body
    let flashMessage
    let actionName
    try {
      if (!requestData.urlSlug) {
        actionName = 'Add'
        await checkWindowAddService.process(requestData)
        flashMessage = `${requestData.checkWindowName} has been created`
      } else {
        actionName = 'Edit'
        await checkWindowEditService.process(requestData)
        flashMessage = 'Changes have been saved'
      }
    } catch (error) {
      if (error.name === 'ValidationError') {
        res.locals.pageTitle = actionName + ' check window'
        const checkWindowData = await checkWindowService.getSubmittedCheckWindowData(requestData)
        return res.render('service-manager/check-window-form', {
          error: error || new ValidationError(),
          errorMessage: checkWindowErrorMessages,
          breadcrumbs: req.breadcrumbs(),
          checkWindowData: checkWindowData,
          successfulPost: false,
          actionName,
          currentYear: moment().format('YYYY')
        })
      }
      return next(error)
    }
    req.flash('info', flashMessage)
    return res.redirect('/service-manager/check-windows')
  },

  /**
   * Soft delete a check window by id.
   * @deprecated
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
  },

  /**
   * View sce settings.
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  getSceSettings: async (req, res, next) => {
    res.locals.pageTitle = 'Settings for MOD'
    req.breadcrumbs(res.locals.pageTitle)
    const { hl } = req.query
    try {
      const sceSchools = await sceService.getSceSchools()
      res.render('service-manager/sce-settings', {
        breadcrumbs: req.breadcrumbs(),
        highlight: hl,
        messages: res.locals.messages,
        countriesTzData: scePresenter.getCountriesTzData(),
        sceSchools
      })
    } catch (error) {
      return next(error)
    }
  },

  /**
   * Cancel sce settings. Redirects to index.
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  cancelSceSettings: async (req, res) => {
    return res.redirect('/service-manager')
  },

  /**
   * Apply SCE school changes
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  postSceSettings: async (req, res, next) => {
    const sceSchools = await sceService.getSceSchools()
    try {
      req.body.urn.forEach((urn, i) => {
        const [countryCode, timezone] = scePresenter.parseCountryTimezoneFromInput(req.body.timezone[urn])
        const schoolIndex = sceSchools.findIndex(s => s.urn.toString() === urn)
        sceSchools[schoolIndex].timezone = timezone
        sceSchools[schoolIndex].countryCode = countryCode
      })
      await sceService.applySceSettings(sceSchools)
    } catch (error) {
      return next(error)
    }

    req.flash('info', 'Timezone saved for the school(s)')
    return res.redirect('/service-manager/mod-settings')
  },

  /**
   * Remove SCE school.
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  getSceRemoveSchool: async (req, res, next) => {
    const { urn } = req.params
    let school

    try {
      school = await sceService.removeSceSchool(urn)
    } catch (error) {
      return next(error)
    }

    req.flash('info', `'${school.name}' removed as MOD school`)
    res.redirect('/service-manager/mod-settings')
  },

  /**
   * Add SCE school form.
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  getSceAddSchool: async (req, res, next) => {
    req.breadcrumbs('Settings for MOD', '/service-manager/mod-settings')
    res.locals.pageTitle = 'Convert school to MOD'
    req.breadcrumbs(res.locals.pageTitle)

    try {
      const schools = await sceService.getSchools()
      const schoolNames = schools.map(s => s.name)
      const schoolUrns = schools.map(s => s.urn.toString())
      res.render('service-manager/sce-add-school', {
        breadcrumbs: req.breadcrumbs(),
        err: res.error || new ValidationError(),
        countriesTzData: scePresenter.getCountriesTzData(),
        schoolNames: JSON.stringify(schoolNames),
        schoolUrns: JSON.stringify(schoolUrns)
      })
    } catch (error) {
      return next(error)
    }
  },

  /**
   * SCE school form submit handler
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  postSceAddSchool: async (req, res, next) => {
    const schools = await sceService.getSchools()
    const schoolNames = schools.map(s => s.name)
    const schoolUrns = schools.map(s => s.urn)

    const {
      urn,
      schoolName
    } = req.body

    const [countryCode, timezone] = scePresenter.parseCountryTimezoneFromInput(req.body.timezone)

    const validationError = await sceSchoolValidator.validate({ urn, schoolName, timezone }, schoolNames, schoolUrns)
    if (validationError.hasError()) {
      res.error = validationError
      return controller.getSceAddSchool(req, res, next)
    }

    const school = schools.find(s => s.urn.toString() === urn && s.name === schoolName)
    try {
      await sceService.insertOrUpdateSceSchool(school.id, timezone, countryCode)
    } catch (error) {
      return next(error)
    }

    req.flash('info', `'${school.name}' added as an MOD school`)
    return res.redirect(`/service-manager/mod-settings?hl=${school.urlSlug}`)
  }
}

module.exports = controller
