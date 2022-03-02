'use strict'

const settingsErrorMessages = require('../lib/errors/settings')
const settingsValidator = require('../lib/validator/settings-validator')

const settingService = require('../services/setting.service')
const pupilCensusService = require('../services/pupil-census.service')
const sceService = require('../services/sce.service')
const sceSchoolValidator = require('../lib/validator/sce-school-validator')
const uploadedFileService = require('../services/uploaded-file.service')
const ValidationError = require('../lib/validation-error')
const scePresenter = require('../helpers/sce')
const schoolService = require('../services/school.service')
const featureToggles = require('feature-toggles')
const { formUtil, formUtilTypes } = require('../lib/form-util')
const organisationBulkUploadService = require('../services/organisation-bulk-upload.service')
const administrationMessageService = require('../services/administration-message.service')
const { JobService } = require('../services/job-service/job.service')

const controller = {

  /**
   * Returns the service-manager (role) landing page
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  getServiceManagerHome: async function getServiceManagerHome (req, res, next) {
    try {
      res.locals.pageTitle = 'MTC Administration Homepage'
      const isNewCheckWindow = featureToggles.isFeatureEnabled('newCheckWindow')
      const serviceMessage = await administrationMessageService.getMessage()
      req.breadcrumbs(res.locals.pageTitle)
      res.render('service-manager/service-manager-home', {
        breadcrumbs: req.breadcrumbs(),
        isNewCheckWindow,
        serviceMessage
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
  getUpdateTiming: async function getUpdateTiming (req, res, next) {
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
  setUpdateTiming: async function setUpdateTiming (req, res, next) {
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
   * View upload pupil census.
   * @param req
   * @param res
   * @param next
   * @param error
   * @returns {Promise.<void>}
   */
  getUploadPupilCensus: async function getUploadPupilCensus (req, res, next, error = null) {
    res.locals.pageTitle = 'Upload pupil census'
    req.breadcrumbs(res.locals.pageTitle)
    let templateFileSize
    try {
      const templateFile = 'assets/csv/mtc-census-headers.csv'
      templateFileSize = uploadedFileService.getFilesize(templateFile)
    } catch (error) {
      return next(error)
    }
    res.render('service-manager/upload-pupil-census', {
      breadcrumbs: req.breadcrumbs(),
      messages: res.locals.messages,
      // pupilCensus,
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
  postUploadPupilCensus: async function postUploadPupilCensus (req, res, next) {
    const uploadFile = req.files && req.files.csvPupilCensusFile
    try {
      const validationError = await pupilCensusService.validateFile(uploadFile)
      if (validationError.hasError()) {
        return controller.getUploadPupilCensus(req, res, next, validationError)
      }
      await pupilCensusService.upload2(uploadFile)
    } catch (error) {
      return next(error)
    }
    req.flash('info', 'Pupil Census file has been uploaded')
    res.redirect('/service-manager/jobs')
  },

  /**
   * Remove a pupil census record.
   * @param req
   * @param res
   * @param next
   * @returns {Promise<*>}
   */
  getRemovePupilCensus: async function getRemovePupilCensus (req, res, next) {
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
   * View sce settings.
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  getSceSettings: async function getSceSettings (req, res, next) {
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
   * @returns {Promise.<void>}
   */
  cancelSceSettings: async function cancelSceSettings (req, res) {
    return res.redirect('/service-manager')
  },

  /**
   * Apply SCE school changes
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  postSceSettings: async function postSceSettings (req, res, next) {
    const sceSchools = await sceService.getSceSchools()
    try {
      req.body.urn.forEach(urn => {
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
  getSceRemoveSchool: async function getSceRemoveSchool (req, res, next) {
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
  getSceAddSchool: async function getSceAddSchool (req, res, next) {
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
  postSceAddSchool: async function postSceAddSchool (req, res, next) {
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
  },

  getManageSchools: async function getManageSchools (req, res, next) {
    res.locals.pageTitle = 'Manage organisations'
    req.breadcrumbs(res.locals.pageTitle)
    try {
      res.render('service-manager/manage-organisations-hub', {
        breadcrumbs: req.breadcrumbs()
      })
    } catch (error) {
      return next(error)
    }
  },

  getAddSchool: async function getAddSchool (req, res, next, error = new ValidationError()) {
    res.locals.pageTitle = 'Add organisation'
    req.breadcrumbs(res.locals.pageTitle)
    try {
      res.render('service-manager/add-school', {
        breadcrumbs: req.breadcrumbs(),
        formData: req.body,
        messages: res.locals.messages,
        error: error
      })
    } catch (error) {
      return next(error)
    }
  },

  postAddSchool: async function postAddSchool (req, res, next) {
    try {
      const { name, dfeNumber, urn } = req.body
      await schoolService.addSchool({
        name: name.trim(),
        dfeNumber: parseInt(dfeNumber, 10),
        urn: parseInt(urn, 10)
      }, req.user.id)
      req.flash('info', 'School added')
      res.redirect('/service-manager/organisations')
    } catch (error) {
      if (error.constructor === ValidationError) {
        return controller.getAddSchool(req, res, next, error)
      }
      return next(error)
    }
  },

  getSearch: async function getSearch (req, res, next, validationError = new ValidationError()) {
    req.breadcrumbs('Manage organisations', '/service-manager/organisations')
    res.locals.pageTitle = 'Search organisations'
    req.breadcrumbs(res.locals.pageTitle)

    try {
      const query = req.body.q ?? ''
      res.render('service-manager/organisations-search', {
        breadcrumbs: req.breadcrumbs(),
        query,
        error: validationError
      })
    } catch (error) {
      return next(error)
    }
  },

  postSearch: async function postSearch (req, res, next) {
    const noSchoolFound = (req, res, next, errorMsg = 'No school found') => {
      const error = new ValidationError()
      error.addError('q', errorMsg)
      return controller.getSearch(req, res, next, error)
    }
    try {
      const query = req.body.q
      if (query === undefined || query === '') {
        return noSchoolFound(req, res, next, 'No query provided')
      }
      let school
      try {
        school = await schoolService.searchForSchool(parseInt(req.body.q?.trim(), 10))
      } catch (error) {
        return noSchoolFound(req, res, next)
      }
      if (!school) {
        return noSchoolFound(req, res, next)
      }
      return res.redirect(`/service-manager/organisations/${encodeURIComponent(school.urlSlug).toLowerCase()}`)
    } catch (error) {
      return next(error)
    }
  },

  getViewOrganisation: async function getViewOrganisation (req, res, next) {
    try {
      req.breadcrumbs('Manage organisations', '/service-manager/organisations')
      req.breadcrumbs('Search organisations', '/service-manager/organisations/search')
      res.locals.pageTitle = 'View organisation'
      req.breadcrumbs(res.locals.pageTitle)
      const school = await schoolService.findOneBySlug(req.params.slug)
      if (!school) {
        return next(new Error(`School not found ${req.params.slug}`))
      }
      school.audits = await schoolService.getSchoolAudits(req.params.slug)
      res.render('service-manager/organisation-detail', {
        breadcrumbs: req.breadcrumbs(),
        school
      })
    } catch (error) {
      return next(error)
    }
  },

  getEditOrganisation: async function getEditOrganisation (req, res, next, validationError = new ValidationError()) {
    try {
      req.breadcrumbs('Manage organisations', '/service-manager/organisations')
      req.breadcrumbs('Search organisations', '/service-manager/organisations/search')
      res.locals.pageTitle = 'Edit organisation'
      req.breadcrumbs(res.locals.pageTitle)
      const school = await schoolService.findOneBySlug(req.params.slug)
      if (!school) {
        return next(new Error(`School not found ${req.params.slug}`))
      }
      const defaults = {
        name: 'name' in req.body ? req.body.name : school.name,
        dfeNumber: 'dfeNumber' in req.body ? req.body.dfeNumber : school.dfeNumber,
        urn: 'urn' in req.body ? req.body.urn : school.urn,
        leaCode: 'leaCode' in req.body ? req.body.leaCode : school.leaCode,
        estabCode: 'estabCode' in req.body ? req.body.estabCode : school.estabCode
      }
      res.render('service-manager/organisation-detail-edit', {
        breadcrumbs: req.breadcrumbs(),
        school,
        error: validationError,
        defaults
      })
    } catch (error) {
      return next(error)
    }
  },

  postEditOrganisation: async function postEditOrganisation (req, res, next) {
    try {
      const school = await schoolService.findOneBySlug(req.params.slug)
      if (!school) {
        req.flash('info', 'School not found')
        return res.redirect('/service-manager/organisations/search')
      }
      const update = {
        name: String(req.body?.name?.trim() ?? ''),
        dfeNumber: Number(formUtil.convertFromString(req.body?.dfeNumber, formUtilTypes.int)),
        urn: Number(formUtil.convertFromString(req.body?.urn, formUtilTypes.int)),
        leaCode: Number(formUtil.convertFromString(req.body?.leaCode, formUtilTypes.int)),
        estabCode: Number(formUtil.convertFromString(req.body?.estabCode, formUtilTypes.int))
      }
      await schoolService.updateSchool(req.params.slug, update, req.user.id)
      req.flash('info', 'School updated')
      return res.redirect(`/service-manager/organisations/${school.urlSlug}`)
    } catch (error) {
      if (error.name === 'ValidationError') {
        return controller.getEditOrganisation(req, res, next, error)
      }
      return next(error)
    }
  },

  getUploadOrganisations: async function getUploadOrganisations (req, res, next, error = new ValidationError()) {
    req.breadcrumbs('Manage organisations', '/service-manager/organisations')
    res.locals.pageTitle = 'Bulk upload organisations'
    req.breadcrumbs(res.locals.pageTitle)
    const jobSlug = req.params.jobSlug
    let jobStatus
    try {
      if (jobSlug !== undefined) {
        jobStatus = await organisationBulkUploadService.getUploadStatus(jobSlug)
      }

      res.render('service-manager/bulk-upload-organisations', {
        breadcrumbs: req.breadcrumbs(),
        fileErrors: error,
        jobStatus: jobStatus
      })
    } catch (error) {
      return next(error)
    }
  },

  postUploadOrganisations: async function postUploadOrganisations (req, res, next) {
    const uploadFile = req.files?.fileOrganisations
    try {
      const validationError = await organisationBulkUploadService.validate(uploadFile)
      if (validationError.hasError()) {
        return controller.getUploadOrganisations(req, res, next, validationError)
      }
      await organisationBulkUploadService.upload(uploadFile)
      req.flash('info', 'Organisation file has been uploaded')
      res.redirect('/service-manager/jobs')
    } catch (error) {
      return next(error)
    }
  },

  downloadJobOutput: async function downloadJobOutput (req, res, next) {
    const slug = req.params.slug
    try {
      const zipResults = await organisationBulkUploadService.getZipResults(slug)
      res.set({
        'Content-Disposition': 'attachment; filename="job-output.zip"',
        'Content-type': 'application/octet-stream',
        'Content-Length': zipResults.length // Buffer.length (bytes)
      })
      res.send(zipResults)
    } catch (error) {
      next(error)
    }
  },

  /**
   * @description Renders audit payload
   * @param {object} req
   * @param {object} res
   * @param {object} next
   */
  getAuditPayload: async function getAuditPayload (req, res, next) {
    const auditEntryId = req.query.auditEntryId.trim()
    let payload
    try {
      payload = await schoolService.getAuditPayload(auditEntryId)
      res.type('json')
      res.send(JSON.stringify(payload, null, '    '))
    } catch (error) {
      res.type('txt')
      res.send(`${error}`)
    }
  },

  /**
   * @description Renders job list
   * @param {object} req
   * @param {object} res
   * @param {object} next
   */
  getJobs: async function getJobs (req, res, next) {
    try {
      res.locals.pageTitle = 'View Jobs'
      req.breadcrumbs(res.locals.pageTitle)
      const jobs = await JobService.getJobSummary()
      res.render('service-manager/jobs', {
        breadcrumbs: req.breadcrumbs(),
        jobs
      })
    } catch (error) {
      return next(error)
    }
  },

  /**
 * @description Renders audit payload
 * @param {object} req
 * @param {object} res
 * @param {object} next
 */
  getJobOutputs: async function getJobOutputs (req, res, next) {
    try {
      const jobId = req.query.jobId.trim()
      const payload = await JobService.getJobOutputs(jobId)
      res.set({
        'Content-Disposition': 'attachment; filename="job-output.zip"',
        'Content-type': 'application/octet-stream',
        'Content-Length': payload.length // Buffer.length (bytes)
      })
      res.send(payload)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = controller
