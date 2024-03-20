'use strict'

const csvFileService = require('../services/csv-file.service')
const fileValidator = require('../lib/validator/file-validator')

const config = require('../config')
const pupilAddService = require('../services/pupil-add-service')
const pupilService = require('../services/pupil.service')
const checkWindowV2Service = require('../services/check-window-v2.service')
const uploadedFileService = require('../services/uploaded-file.service')
const pupilUploadService = require('../services/pupil-upload.service')
const pupilValidator = require('../lib/validator/pupil-validator')
const pupilPresenter = require('../helpers/pupil-presenter')
const schoolService = require('../services/school.service')
const businessAvailabilityService = require('../services/business-availability.service')
const pupilEditService = require('../services/pupil-edit.service')
const ValidationError = require('../lib/validation-error')
const logger = require('../services/log.service').getLogger()
const { PupilHistoryService } = require('../services/pupil-history/pupil-history-service')
const roles = require('../lib/consts/roles')

const controller = {
  /**
   * Get list of pupils.
   * @param req
   * @param res
   * @param next
   * @param error
   * @returns {Promise<void>}
   */
  getAddPupil: async function getAddPupil (req, res, next, error = null) {
    res.locals.pageTitle = 'Add pupil'
    try {
      const pupilExampleYear = pupilPresenter.getPupilExampleYear()
      req.breadcrumbs('View, add or edit pupils on your school\'s register', '/pupil-register/pupils-list')
      req.breadcrumbs(res.locals.pageTitle)
      const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
      const availabilityData = await businessAvailabilityService.getAvailabilityData(req.user.schoolId, checkWindowData, req.user.timezone)

      if (availabilityData.hdfSubmitted && !req.user.role === roles.staAdmin) {
        return res.render('availability/section-unavailable', {
          title: res.locals.pageTitle,
          breadcrumbs: req.breadcrumbs()
        })
      }
      res.render('pupil-register/add-pupil', {
        formData: req.body,
        error: error || new ValidationError(),
        breadcrumbs: req.breadcrumbs(),
        pupilExampleYear
      })
    } catch (error) {
      next(error)
    }
  },
  /**
   * Post new pupil record.
   * @param req
   * @param res
   * @param next
   * @returns {Promise<void>}
   */
  postAddPupil: async function postAddPupil (req, res, next) {
    res.locals.pageTitle = 'Add pupil'
    try {
      const pupil = await pupilAddService.addPupil(req.body, req.user.schoolId, req.user.id)
      req.flash('info', '1 new pupil has been added')
      const highlight = JSON.stringify([pupil.urlSlug.toString()])
      res.redirect(`/pupil-register/pupils-list?hl=${highlight}`)
    } catch (error) {
      if (error.name === 'ValidationError') {
        return controller.getAddPupil(req, res, next, error)
      }
      logger.error(error)
      next(error)
    }
  },
  /**
   * Add multiple pupils, view page.
   * @param req
   * @param res
   * @param next
   */
  getAddMultiplePupils: async function getAddMultiplePupils (req, res, next) {
    res.locals.pageTitle = 'Add multiple pupils'
    const { hasError, fileErrors } = res
    let templateFileSize
    let csvErrorFileSize
    const { csvErrorFile } = req.session
    const templateFile = 'assets/csv/mtc-pupil-details-template-sheet-1.csv'
    try {
      const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
      const availabilityData = await businessAvailabilityService.getAvailabilityData(req.user.schoolId, checkWindowData, req.user.timezone)
      if (availabilityData.hdfSubmitted) {
        return res.render('availability/section-unavailable', {
          title: res.locals.pageTitle,
          breadcrumbs: req.breadcrumbs()
        })
      }
      templateFileSize = uploadedFileService.getFilesize(templateFile)
      csvErrorFileSize = await uploadedFileService.getAzureBlobFileSize(csvErrorFile)
      req.breadcrumbs('View, add or edit pupils on your school\'s register', '/pupil-register/pupils-list')
      req.breadcrumbs(res.locals.pageTitle)
      res.render('pupil-register/add-multiple-pupils', {
        breadcrumbs: req.breadcrumbs(),
        hasError,
        fileErrors,
        templateFileSize,
        csvErrorFileSize
      })
    } catch (error) {
      next(error)
    }
  },
  /**
   * Save multiple pupils.
   * @param req
   * @param res
   * @param next
   * @returns {Promise<*>}
   */
  postAddMultiplePupils: async function postAddMultiplePupils (req, res, next) {
    let school
    try {
      school = await schoolService.findOneById(req.user.schoolId)
      if (!school) {
        throw new Error(`School with id [${req.user.schoolId}] not found`)
      }
    } catch (error) {
      return next(error)
    }
    const uploadFile = req.files && req.files.csvTemplateFile
    try {
      const fileErrors = await fileValidator.validate(uploadFile, 'file-upload')
      if (fileErrors.hasError()) {
        res.hasError = true
        res.fileErrors = fileErrors
        return controller.getAddMultiplePupils(req, res, next)
      }
    } catch (error) {
      return next(error)
    }
    let uploadResult
    try {
      uploadResult = await pupilUploadService.upload(school, uploadFile, req.user.id)
    } catch (error) {
      return next(error)
    }
    // Upload errors found
    if (uploadResult.error) {
      return next(uploadResult.error)
    }
    if (uploadResult.hasValidationError) {
      req.session.csvErrorFile = uploadResult.csvErrorFile
      res.hasError = uploadResult.hasValidationError
      res.fileErrors = uploadResult.fileErrors
      return controller.getAddMultiplePupils(req, res, next)
    } else {
      req.flash('info', `${uploadResult.pupilIds && uploadResult.pupilIds.length} new pupils have been added`)
      const savedPupils = await pupilService.fetchMultipleByIds(uploadResult.pupilIds, req.user.schoolId)
      const slugs = savedPupils.map(p => p.urlSlug)
      const qp = encodeURIComponent(JSON.stringify(slugs))
      res.redirect(`/pupil-register/pupils-list?hl=${qp}`)
    }
  },
  /**
   * Get error CSV file.
   * @param req
   * @param res
   * @returns {Promise<void>}
   */
  getErrorCSVFile: async function getErrorCSVFile (req, res) {
    const blobFile = await csvFileService.getCsvFileAsBuffer(req.session.csvErrorFile)
    res.setHeader('Content-type', 'text/csv')
    res.setHeader('Content-disposition', 'attachment; filename=multiple_pupils_errors.csv')
    res.write(blobFile)
    res.end()
  },
  /**
   * Get pupil by id.
   * @param req
   * @param res
   * @param next
   * @returns {Promise<*>}
   */
  getEditPupilById: async function getEditPupilById (req, res, next) {
    res.locals.pageTitle = 'Edit pupil data'
    let pupilExampleYear
    try {
      const pupil = await pupilService.fetchOneBySlugWithAgeReason(req.params.id, req.user.schoolId)
      pupilExampleYear = pupilPresenter.getPupilExampleYear()
      if (!pupil) {
        return next(new Error(`Pupil ${req.params.id} not found`))
      }

      const pupilData = pupilAddService.formatPupilData(pupil)

      req.breadcrumbs('View, add or edit pupils on your school\'s register', '/pupil-register/pupils-list')
      req.breadcrumbs(res.locals.pageTitle)
      res.render('pupil-register/edit-pupil', {
        formData: pupilData,
        error: new ValidationError(),
        breadcrumbs: req.breadcrumbs(),
        pupilExampleYear
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
      pupil = await pupilService.fetchOneBySlugWithAgeReason(req.body.urlSlug, req.user.schoolId)
      if (!pupil) {
        return next(new Error(`Pupil ${req.body.urlSlug} not found`))
      }

      school = await schoolService.findOneById(pupil.school_id)
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
      return res.render('pupil-register/edit-pupil', {
        school,
        formData: req.body,
        error: validationError,
        breadcrumbs: req.breadcrumbs(),
        pupilExampleYear
      })
    }
    try {
      await pupilEditService.update(pupil, req.body, req.user.schoolId, req.user.id)
      req.flash('info', 'Changes to pupil details have been saved')
    } catch (error) {
      return next(error)
    }
    const highlight = JSON.stringify([pupil.urlSlug.toString()])
    res.locals.isSubmitMetaRedirectUrl = true
    res.locals.metaRedirectUrl = `/pupil-register/pupils-list?hl=${highlight}`
    res.locals.waitTimeBeforeMetaRedirectInSeconds = config.WaitTimeBeforeMetaRedirectInSeconds
    res.render('redirect-delay.ejs', {
      redirectMessage: 'Saving changes...'
    })
  },

  getViewPupilHistory: async function getViewPupilHistory (req, res, next) {
    try {
      res.locals.pageTitle = 'Pupil history'
      req.breadcrumbs('View, add or edit pupils on your school\'s register', '/pupil-register/pupils-list')
      req.breadcrumbs(res.locals.pageTitle)
      const pupilHistory = await PupilHistoryService.getHistory(req.params.urlSlug)
      const isStaAdmin = (req.user.role === roles.staAdmin)
      console.log('isStaAdmin', isStaAdmin)
      return res.render('pupil-register/pupil-history', {
        breadcrumbs: req.breadcrumbs(),
        pupilHistory,
        isStaAdmin
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = controller
