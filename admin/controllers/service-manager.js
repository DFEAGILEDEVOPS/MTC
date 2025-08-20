'use strict'

const settingsErrorMessages = require('../lib/errors/settings')
const settingsValidator = require('../lib/validator/settings-validator')
const settingService = require('../services/setting.service')
const pupilCensusService = require('../services/pupil-census.service')
const pupilService = require('../services/pupil.service')
const pupilEditService = require('../services/pupil-edit.service')
const sceService = require('../services/sce.service')
const sceSchoolValidator = require('../lib/validator/sce-school-validator')
const uploadedFileService = require('../services/uploaded-file.service')
const pupilValidator = require('../lib/validator/pupil-validator')
const ValidationError = require('../lib/validation-error')
const scePresenter = require('../helpers/sce')
const pupilPresenter = require('../helpers/pupil-presenter')
const schoolService = require('../services/school.service')
const featureToggles = require('feature-toggles')
const { formUtil, formUtilTypes } = require('../lib/form-util')
const organisationBulkUploadService = require('../services/organisation-bulk-upload.service')
const { JobService } = require('../services/job/job.service')
const { ServiceManagerPupilService } = require('../services/service-manager/pupil/service-manager.pupil.service')
const { validate } = require('uuid')
const { PupilAnnulmentService } = require('../services/service-manager/pupil-annulment/pupil-annulment.service')
const { TypeOfEstablishmentService } = require('../services/type-of-establishment/type-of-establishment-service')
const { ServiceManagerSchoolService } = require('../services/service-manager/school/school.service')
const { ServiceManagerAttendanceService } = require('../services/service-manager/attendance/service-manager.attendance.service')
const { PupilFreezeService } = require('../services/service-manager/pupil-freeze/pupil-freeze.service')
const headteacherDeclarationService = require('../services/headteacher-declaration.service')
const dateService = require('../services/date.service')
const pupilAddService = require('../services/pupil-add-service')
const roles = require('../lib/consts/roles')
const config = require('../config')

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
      const newSettings = {
        questionTimeLimit: req.body.questionTimeLimit,
        loadingTimeLimit: req.body.loadingTimeLimit,
        checkTimeLimit: req.body.checkTimeLimit,
        isPostAdminEndDateUnavailable: req.body.isPostAdminEndDateUnavailable === '1'
      }
      const validationError = await settingsValidator.validate(newSettings)
      if (validationError.hasError()) {
        res.locals.pageTitle = 'Settings on pupil check'
        req.breadcrumbs(res.locals.pageTitle)
        return res.render('service-manager/check-settings', {
          settings: newSettings,
          error: validationError,
          errorMessage: settingsErrorMessages,
          breadcrumbs: req.breadcrumbs()
        })
      }
      await settingService.update(newSettings, req.user.id)
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
      const typeOfEstablishmentData = await TypeOfEstablishmentService.getEstablishmentDataSortedByName()
      res.render('service-manager/add-school', {
        breadcrumbs: req.breadcrumbs(),
        formData: req.body,
        messages: res.locals.messages,
        error,
        typeOfEstablishmentData
      })
    } catch (error) {
      return next(error)
    }
  },

  postAddSchool: async function postAddSchool (req, res, next) {
    try {
      const { name, dfeNumber, urn, typeOfEstablishmentCode, isTestSchool } = req.body
      const newSchool = await schoolService.addSchool({
        name: name.trim(),
        dfeNumber: parseInt(dfeNumber, 10),
        urn: parseInt(urn, 10),
        typeOfEstablishmentCode: parseInt(typeOfEstablishmentCode, 10),
        isTestSchool: isTestSchool === 'isTestSchool'
      }, req.user.id)
      req.flash('info', 'School added')
      res.redirect(`/service-manager/organisations/${newSchool.urlSlug.toLowerCase()}`)
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
      } catch {
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
      const typeOfEstablishmentData = await TypeOfEstablishmentService.getEstablishmentDataSortedByName()

      if (!school) {
        return next(new Error(`School not found ${req.params.slug}`))
      }
      const defaults = {
        name: 'name' in req.body ? req.body.name : school.name,
        dfeNumber: 'dfeNumber' in req.body ? req.body.dfeNumber : school.dfeNumber,
        urn: 'urn' in req.body ? req.body.urn : school.urn,
        leaCode: 'leaCode' in req.body ? req.body.leaCode : school.leaCode,
        estabCode: 'estabCode' in req.body ? req.body.estabCode : school.estabCode,
        typeOfEstablishmentCode: 'typeOfEstablishmentCode' in req.body ? req.body.typeOfEstablishmentCode : school.typeOfEstablishmentCode,
        isTestSchool: 'isTestSchool' in req.body ? req.body.isTestSchool === 'true' : school.isTestSchool
      }

      res.render('service-manager/organisation-detail-edit', {
        breadcrumbs: req.breadcrumbs(),
        school,
        error: validationError,
        typeOfEstablishmentData,
        defaults
      })
    } catch (error) {
      return next(error)
    }
  },

  getHdfSummary: async function getHdfSummary (req, res, next) {
    try {
      req.breadcrumbs('Manage organisations', '/service-manager/organisations')
      req.breadcrumbs('Search organisations', '/service-manager/organisations/search')
      req.breadcrumbs('View organisation', `/service-manager/organisations/${req.params.slug}`)
      res.locals.pageTitle = 'HDF Submission Summary'
      req.breadcrumbs(res.locals.pageTitle)
      const school = await schoolService.findOneBySlug(req.params.slug)
      const includeDeleted = true
      const hdf = await headteacherDeclarationService.findLatestHdfForSchool(school.dfeNumber, includeDeleted)
      let submissionDate = ''
      let deleted = false
      let submitted = false
      if (!hdf) {
        // no hdf submitted
        submissionDate = '(No HDF submitted)'
      } else {
        submitted = true
        deleted = hdf.isDeleted
        const hdfSignedDate = dateService.formatDateAndTime(hdf.signedDate)
        submissionDate = `${hdfSignedDate} (UTC)`
      }
      res.render('service-manager/hdf-summary', {
        breadcrumbs: req.breadcrumbs(),
        school,
        hdfStatusSummary: submissionDate,
        deleted,
        submitted
      })
    } catch (error) {
      return next(error)
    }
  },

  postDeleteHdf: async function postDeleteHdf (req, res, next) {
    try {
      const school = await schoolService.findOneBySlug(req.params.slug)
      await headteacherDeclarationService.hardDeleteHdfSigning(school.id)
      return res.redirect(`/service-manager/organisations/${req.params.slug}/hdfstatus`)
    } catch (error) {
      return next(error)
    }
  },

  postDeleteHdfUndo: async function postDeleteHdfUndo (req, res, next) {
    try {
      const school = await schoolService.findOneBySlug(req.params.slug)
      await headteacherDeclarationService.undoSoftDeleteHdfSigning(school.id, req.user.id)
      return res.redirect(`/service-manager/organisations/${req.params.slug}/hdfstatus`)
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
        estabCode: Number(formUtil.convertFromString(req.body?.estabCode, formUtilTypes.int)),
        typeOfEstablishmentCode: Number(formUtil.convertFromString(req.body?.typeOfEstablishmentCode, formUtilTypes.Int)),
        isTestSchool: req.body?.isTestSchool === 'true'
      }
      await schoolService.updateSchool(req.params.slug, update, req.user.id)
      req.flash('info', 'School updated')
      return res.redirect(`/service-manager/organisations/${school.urlSlug.toLowerCase()}`)
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
        jobStatus
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
  getAuditPayload: async function getAuditPayload (req, res) {
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
      const urlSlug = req.query.urlSlug.trim()
      const payload = await JobService.getJobOutputs(urlSlug)
      res.set({
        'Content-Disposition': 'attachment; filename="job-output.zip"',
        'Content-type': 'application/octet-stream',
        'Content-Length': payload.length // Buffer.length (bytes)
      })
      res.send(payload)
    } catch (error) {
      next(error)
    }
  },

  /**
   * @description Renders pupil search
   * @param {object} req
   * @param {object} res
   * @param {object} next
   * @param {object} validationError
   */
  getPupilSearch: async function getPupilSearch (req, res, next, validationError = new ValidationError()) {
    res.locals.pageTitle = 'Pupil Search'
    req.breadcrumbs(res.locals.pageTitle)

    try {
      const query = req.body.q ?? ''
      res.render('service-manager/pupil-search', {
        breadcrumbs: req.breadcrumbs(),
        query,
        error: validationError,
        results: undefined
      })
    } catch (error) {
      return next(error)
    }
  },

  /**
   * @description Renders pupil search
   * @param {object} req
   * @param {object} res
   * @param {object} next
   */
  postPupilSearch: async function postPupilSearch (req, res, next) {
    const pupilSearchErrorHandler = (req, res, next, errorMsg = 'No pupil found') => {
      const error = new ValidationError()
      error.addError('q', errorMsg)
      return controller.getPupilSearch(req, res, next, error)
    }
    try {
      const query = req.body.q
      if (query === undefined || query === '') {
        return pupilSearchErrorHandler(req, res, next, 'No query provided')
      }
      let results
      try {
        results = await ServiceManagerPupilService.findPupilByUpn(query)
      } catch (error) {
        return pupilSearchErrorHandler(req, res, next, error.message)
      }
      if (!results || results.length === 0) {
        return pupilSearchErrorHandler(req, res, next)
      }
      if (results.length === 1) {
        return res.redirect(`/service-manager/pupil-summary/${encodeURIComponent(results[0].urlSlug).toLowerCase()}`)
      } else {
        // multiple results to select from...
        res.locals.pageTitle = 'Pupil Search'
        return res.render('service-manager/pupil-search', {
          breadcrumbs: req.breadcrumbs(),
          results,
          query,
          error: new ValidationError()
        })
      }
    } catch (error) {
      return next(error)
    }
  },

  getPupilSummary: async function getPupilSummary (req, res, next) {
    const pupilUrlSlug = req.params.slug
    if (!pupilUrlSlug) {
      return res.redirect('/service-manager/pupil-search/')
    }
    if (!validate(pupilUrlSlug)) {
      return next(new Error(`${pupilUrlSlug} is not a valid uuid`))
    }
    const pupilData = await ServiceManagerPupilService.getPupilDetailsByUrlSlug(pupilUrlSlug)
    res.locals.pageTitle = 'Pupil Summary'
    req.breadcrumbs('Pupil Search', '/service-manager/pupil-search')
    req.breadcrumbs(res.locals.pageTitle)
    res.render('service-manager/pupil-summary', {
      breadcrumbs: req.breadcrumbs(),
      pupil: pupilData
    })
  },

  getPupilAnnulment: async function getPupilAnnulment (req, res, next, validationError = new ValidationError()) {
    const urlSlug = req.params.slug
    res.locals.pageTitle = 'Annul Pupil'
    const pupil = await ServiceManagerPupilService.getPupilDetailsByUrlSlug(urlSlug)
    req.breadcrumbs('Pupil Summary', `/service-manager/pupil-summary/${encodeURIComponent(urlSlug).toLowerCase()}`)
    req.breadcrumbs(res.locals.pageTitle)
    res.render('service-manager/annul-pupil', {
      breadcrumbs: req.breadcrumbs(),
      error: validationError,
      pupil
    })
  },

  postPupilAnnulment: async function postPupilAnnulment (req, res, next) {
    const annulPupilErrorHandler = (req, res, next, errorMsg = 'No matching pupil found with specified UPN') => {
      const error = new ValidationError()
      error.addError('upn', errorMsg)
      return controller.getPupilAnnulment(req, res, next, error)
    }
    try {
      const confirmedUpn = req.body.upn
      const annulmentType = req.body.annulmentType
      if (confirmedUpn === undefined || confirmedUpn === '') {
        return annulPupilErrorHandler(req, res, next, 'No upn provided')
      }
      const urlSlug = req.params.slug
      const pupil = await ServiceManagerPupilService.getPupilDetailsByUrlSlug(urlSlug)
      if (pupil.upn !== confirmedUpn) return annulPupilErrorHandler(req, res, next, 'UPN does not match pupil')
      await PupilAnnulmentService.applyAnnulment(urlSlug, req.user.id, pupil.schoolId, annulmentType)
      return res.redirect(`/service-manager/pupil-summary/${encodeURIComponent(urlSlug).toLowerCase()}`)
    } catch (error) {
      return annulPupilErrorHandler(req, res, next, error.message)
    }
  },

  getPupilAnnulmentUndo: async function getPupilAnnulmentUndo (req, res, next, validationError = new ValidationError()) {
    const urlSlug = req.params.slug
    res.locals.pageTitle = 'Undo Pupil Annulment'
    const pupil = await ServiceManagerPupilService.getPupilDetailsByUrlSlug(urlSlug)
    req.breadcrumbs('Pupil Summary', `/service-manager/pupil-summary/${encodeURIComponent(urlSlug).toLowerCase()}`)
    req.breadcrumbs(res.locals.pageTitle)
    res.render('service-manager/annul-pupil-undo', {
      breadcrumbs: req.breadcrumbs(),
      error: validationError,
      pupil
    })
  },

  postPupilAnnulmentUndo: async function postPupilAnnulmentUndo (req, res, next) {
    const annulPupilErrorHandler = (req, res, next, errorMsg = 'No matching pupil found with specified UPN') => {
      const error = new ValidationError()
      error.addError('upn', errorMsg)
      return controller.getPupilAnnulmentUndo(req, res, next, error)
    }
    try {
      const confirmedUpn = req.body.upn
      if (confirmedUpn === undefined || confirmedUpn === '') {
        return annulPupilErrorHandler(req, res, next, 'No upn provided')
      }
      const urlSlug = req.params.slug
      const pupil = await ServiceManagerPupilService.getPupilDetailsByUrlSlug(urlSlug)
      if (pupil.upn !== confirmedUpn) return annulPupilErrorHandler(req, res, next, 'UPN does not match pupil')
      await PupilAnnulmentService.removeAnnulment(urlSlug, req.user.id, pupil.schoolId)
      return res.redirect(`/service-manager/pupil-summary/${encodeURIComponent(urlSlug).toLowerCase()}`)
    } catch (error) {
      return annulPupilErrorHandler(req, res, next, error.message)
    }
  },

  getPupilMove: async function getPupilMove (req, res, next, validationError = new ValidationError()) {
    const urlSlug = req.params.slug
    res.locals.pageTitle = 'Move pupil'
    const pupil = await ServiceManagerPupilService.getPupilDetailsByUrlSlug(urlSlug.trim().toUpperCase())
    req.breadcrumbs('Pupil search', '/service-manager/pupil-search')
    req.breadcrumbs('Pupil summary', `/service-manager/pupil-summary/${encodeURIComponent(urlSlug).toLowerCase()}`)
    req.breadcrumbs(res.locals.pageTitle)
    res.render('service-manager/pupil/move-form', {
      breadcrumbs: req.breadcrumbs(),
      error: validationError,
      pupil
    })
  },

  postPupilMove: async function postPupilMove (req, res, next) {
    const pupilMoveErrorHandler = (req, res, next, errorMsg = 'No school found') => {
      const error = new ValidationError()
      error.addError('targetSchoolURN', errorMsg)
      return controller.getPupilMove(req, res, next, error)
    }

    let targetSchool
    let pupil

    try {
      const pupilUrlSlug = req.body.pupilUrlSlug
      if (pupilUrlSlug === undefined || pupilUrlSlug === '') {
        return pupilMoveErrorHandler(req, res, next, 'Pupil not found')
      }
      const targetSchoolURN = req.body.targetSchoolURN
      if (targetSchoolURN === undefined || targetSchoolURN === '') {
        return pupilMoveErrorHandler(req, res, next, 'No target school provided')
      }
      try {
        targetSchool = await ServiceManagerSchoolService.findSchoolByUrn(targetSchoolURN)
        pupil = await ServiceManagerPupilService.getPupilDetailsByUrlSlug(pupilUrlSlug)
        if (pupil.schoolId === targetSchool.id) {
          return pupilMoveErrorHandler(req, res, next, 'Target school is the existing school!')
        }
      } catch (error) {
        return pupilMoveErrorHandler(req, res, next, 'Error retrieving school: ' + error.message)
      }
    } catch (error) {
      return pupilMoveErrorHandler(req, res, next, 'Processing error: ' + error.message)
    }
    res.redirect(`/service-manager/pupil/move/${encodeURIComponent(pupil.urlSlug.toLowerCase())}/confirm/${encodeURIComponent(targetSchool.urlSlug.toLowerCase())}`)
  },

  getPupilMoveConfirm: async function getPupilMoveConfirm (req, res) {
    let pupil, school, pupilUrlSlug, schoolUrlSlug
    try {
      res.locals.pageTitle = 'Confirm move pupil'
      pupilUrlSlug = req.params.pupilSlug
      schoolUrlSlug = req.params.schoolSlug
      pupil = await ServiceManagerPupilService.getPupilDetailsByUrlSlug(pupilUrlSlug.trim().toUpperCase())
      school = await ServiceManagerSchoolService.findSchoolBySlug(schoolUrlSlug.trim().toUpperCase())
      req.breadcrumbs('Pupil search', '/service-manager/pupil-search')
      req.breadcrumbs('Pupil summary', `/service-manager/pupil-summary/${encodeURIComponent(pupilUrlSlug).toLowerCase()}`)
      req.breadcrumbs(res.locals.pageTitle)
      res.render('service-manager/pupil/move-confirm', {
        breadcrumbs: req.breadcrumbs(),
        pupil,
        school
      })
    } catch (error) {
      req.flash('error', `Error confirming target school: ${error.message}`)
      res.redirect(`/service-manager/pupil/move/${encodeURIComponent(pupilUrlSlug)}`)
    }
  },

  postPupilMoveConfirmed: async function postPupilMoveConfirmed (req, res) {
    let pupil, school, pupilUrlSlug, schoolUrlSlug
    try {
      pupilUrlSlug = req.params.pupilSlug
      schoolUrlSlug = req.params.schoolSlug
      pupil = await ServiceManagerPupilService.getPupilDetailsByUrlSlug(pupilUrlSlug.trim().toUpperCase())
      school = await ServiceManagerSchoolService.findSchoolBySlug(schoolUrlSlug.trim().toUpperCase())
      await ServiceManagerPupilService.movePupilToSchool(pupil, school, req.user.id)
    } catch (error) {
      req.flash('error', `${error.message}`)
      res.redirect(`/service-manager/pupil/move/${encodeURIComponent(pupilUrlSlug)}`)
    }
    req.flash('info', `Pupil moved to ${school.name} (${school.urn})`)
    res.redirect(`/service-manager/pupil-summary/${encodeURIComponent(pupilUrlSlug)}`)
  },

  getPupilFreeze: async function getPupilFreeze (req, res, next, validationError = new ValidationError()) {
    const urlSlug = req.params.slug
    res.locals.pageTitle = 'Freeze Pupil'
    const pupil = await ServiceManagerPupilService.getPupilDetailsByUrlSlug(urlSlug)
    req.breadcrumbs('Pupil Summary', `/service-manager/pupil-summary/${encodeURIComponent(urlSlug).toLowerCase()}`)
    req.breadcrumbs(res.locals.pageTitle)
    res.render('service-manager/pupil/freeze', {
      breadcrumbs: req.breadcrumbs(),
      error: validationError,
      pupil
    })
  },

  postPupilFreeze: async function postPupilFreeze (req, res, next) {
    const freezePupilErrorHandler = (req, res, next, errorMsg = 'No matching pupil found with specified UPN') => {
      const error = new ValidationError()
      error.addError('upn', errorMsg)
      return controller.getPupilFreeze(req, res, next, error)
    }
    try {
      const confirmedUpn = req.body.upn
      if (confirmedUpn === undefined || confirmedUpn === '') {
        return freezePupilErrorHandler(req, res, next, 'No upn provided')
      }
      const urlSlug = req.params.slug
      const pupil = await ServiceManagerPupilService.getPupilDetailsByUrlSlug(urlSlug)
      if (pupil.upn !== confirmedUpn) return freezePupilErrorHandler(req, res, next, 'UPN does not match pupil')
      await PupilFreezeService.applyFreeze(urlSlug, req.user.id, pupil.schoolId)
      return res.redirect(`/service-manager/pupil-summary/${encodeURIComponent(urlSlug).toLowerCase()}`)
    } catch (error) {
      return freezePupilErrorHandler(req, res, next, error.message)
    }
  },

  getPupilThaw: async function getPupilThaw (req, res, next, validationError = new ValidationError()) {
    const urlSlug = req.params.slug
    res.locals.pageTitle = 'Thaw Pupil'
    const pupil = await ServiceManagerPupilService.getPupilDetailsByUrlSlug(urlSlug)
    req.breadcrumbs('Pupil Summary', `/service-manager/pupil-summary/${encodeURIComponent(urlSlug).toLowerCase()}`)
    req.breadcrumbs(res.locals.pageTitle)
    res.render('service-manager/pupil/thaw', {
      breadcrumbs: req.breadcrumbs(),
      error: validationError,
      pupil
    })
  },

  postPupilThaw: async function postPupilThaw (req, res, next) {
    const thawPupilErrorHandler = (req, res, next, errorMsg = 'No matching pupil found with specified UPN') => {
      const error = new ValidationError()
      error.addError('upn', errorMsg)
      return controller.getPupilThaw(req, res, next, error)
    }
    try {
      const confirmedUpn = req.body.upn
      if (confirmedUpn === undefined || confirmedUpn === '') {
        return thawPupilErrorHandler(req, res, next, 'No upn provided')
      }
      const urlSlug = req.params.slug
      const pupil = await ServiceManagerPupilService.getPupilDetailsByUrlSlug(urlSlug)
      if (pupil.upn !== confirmedUpn) return thawPupilErrorHandler(req, res, next, 'UPN does not match pupil')
      await PupilFreezeService.applyThaw(urlSlug, req.user.id, pupil.schoolId)
      return res.redirect(`/service-manager/pupil-summary/${encodeURIComponent(urlSlug).toLowerCase()}`)
    } catch (error) {
      return thawPupilErrorHandler(req, res, next, error.message)
    }
  },
  /**
   * Get pupil by id.
   * @param req
   * @param res
   * @param next
   * @returns {Promise<*>}
   */
  getEditPupilById: async function getEditPupilById (req, res, next) {
    const pupilDetails = await ServiceManagerPupilService.getPupilDetailsByUrlSlug(req.params.slug)
    res.locals.pageTitle = 'Edit pupil data'
    let pupilExampleYear
    try {
      const pupil = await pupilService.fetchOnePupilBySlug(req.params.slug, pupilDetails.schoolId)
      pupilExampleYear = pupilPresenter.getPupilExampleYear()
      if (!pupil) {
        return next(new Error(`Pupil ${req.params.id} not found`))
      }

      const pupilData = pupilAddService.formatPupilData(pupil)
      const isServiceManager = (req.user.role === roles.serviceManager)
      req.breadcrumbs('View, add or edit pupils on your school\'s register', '/pupil-register/pupils-list')
      req.breadcrumbs(res.locals.pageTitle)
      res.render('service-manager/pupil/edit', {
        formData: pupilData,
        error: new ValidationError(),
        breadcrumbs: req.breadcrumbs(),
        pupilExampleYear,
        isServiceManager,
        pupilDetails
      })
    } catch (error) {
      next(error)
    }
  },
  /**
   * Post pupil
   * @param req
   * @param res
   * @param next
   * @returns {Promise<*>}
   */
  postEditPupil: async function postEditPupil (req, res, next) {
    let pupil
    let school
    let validationError
    // In case we render an error page
    res.locals.pageTitle = 'Edit pupil data'
    try {
      const pupilDetails = await ServiceManagerPupilService.getPupilDetailsByUrlSlug(req.body.urlSlug)
      pupil = await pupilService.fetchOnePupilBySlug(req.body.urlSlug, pupilDetails.schoolId)
      if (!pupil) {
        return next(new Error(`Pupil ${req.body.urlSlug} not found`))
      }

      school = await schoolService.findOneById(pupilDetails.schoolId)
      if (!school) {
        return next(new Error('School not found'))
      }
      validationError = await pupilValidator.validate(req.body, school.id)
    } catch (error) {
      return next(error)
    }

    if (validationError.hasError()) {
      const pupilExampleYear = pupilPresenter.getPupilExampleYear()
      req.breadcrumbs('View, add or edit pupils on your school\'s register', '/pupil-register/pupils-list')
      req.breadcrumbs(res.locals.pageTitle)
      return res.render('service-manager/pupil/edit', {
        school,
        formData: req.body,
        error: validationError,
        breadcrumbs: req.breadcrumbs(),
        pupilExampleYear
      })
    }
    try {
      await pupilEditService.update(pupil, req.body, school.id, req.user.id)
      req.flash('info', 'Changes to pupil details have been saved')
    } catch (error) {
      return next(error)
    }
    const highlight = JSON.stringify([pupil.urlSlug.toString()])
    res.locals.isSubmitMetaRedirectUrl = true
    res.locals.metaRedirectUrl = `/service-manager/pupil-summary/${encodeURIComponent(pupil.urlSlug.toLowerCase())}?hl=${highlight}`
    res.locals.waitTimeBeforeMetaRedirectInSeconds = config.WaitTimeBeforeMetaRedirectInSeconds
    res.render('redirect-delay.ejs', {
      redirectMessage: 'Saving changes...'
    })
  },

  getAttendanceCodes: async function getAttendanceCodes (req, res, next) {
    res.locals.pageTitle = 'Attendance codes'
    req.breadcrumbs(res.locals.pageTitle)
    try {
      const attendanceCodes = await ServiceManagerAttendanceService.getAttendanceCodes()
      res.render('service-manager/attendance-codes', {
        breadcrumbs: req.breadcrumbs(),
        attendanceCodes
      })
    } catch (error) {
      return next(error)
    }
  },

  postUpdateAttendanceCodes: async function postUpdateAttendanceCodes (req, res, next) {
    try {
      const visibleCodes = req.body.attendanceCodes
      await ServiceManagerAttendanceService.setVisibleAttendanceCodes(visibleCodes)
    } catch (error) {
      return next(error)
    }
    req.flash('info', 'Attendance code visibility changed')
    res.redirect('/service-manager/attendance-codes')
  }
}

module.exports = controller
