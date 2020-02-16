'use strict'

const azureFileDataService = require('../services/data-access/azure-file.data.service')
const fileValidator = require('../lib/validator/file-validator')

const config = require('../config')
const pupilAddService = require('../services/pupil-add-service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const checkWindowV2Service = require('../services/check-window-v2.service')
const uploadedFileService = require('../services/uploaded-file.service')
const pupilUploadService = require('../services/pupil-upload.service')
const pupilValidator = require('../lib/validator/pupil-validator')
const pupilPresenter = require('../helpers/pupil-presenter')
const schoolDataService = require('../services/data-access/school.data.service')
const businessAvailabilityService = require('../services/business-availability.service')
const pupilEditService = require('../services/pupil-edit.service')
const ValidationError = require('../lib/validation-error')
const logger = require('../services/log.service').getLogger()

/**
 * Get list of pupils.
 * @param req
 * @param res
 * @param next
 * @param error
 * @returns {Promise<void>}
 */
const getAddPupil = async (req, res, next, error = null) => {
  res.locals.pageTitle = 'Add pupil'
  try {
    const pupilExampleYear = pupilPresenter.getPupilExampleYear()
    req.breadcrumbs('Pupil register', '/pupil-register/pupils-list')
    req.breadcrumbs(res.locals.pageTitle)
    const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    const availabilityData = await businessAvailabilityService.getAvailabilityData(req.user.schoolId, checkWindowData, req.user.timezone)
    if (availabilityData.hdfSubmitted) {
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
}

/**
 * Post new pupil record.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
const postAddPupil = async (req, res, next) => {
  res.locals.pageTitle = 'Add pupil'
  try {
    const pupil = await pupilAddService.addPupil(req.body, req.user.schoolId)
    req.flash('info', '1 new pupil has been added')
    const highlight = JSON.stringify([pupil.urlSlug.toString()])
    res.redirect(`/pupil-register/pupils-list?hl=${highlight}`)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return getAddPupil(req, res, next, error)
    }
    logger.error(error)
    next(error)
  }
}

/**
 * Add multiple pupils, view page.
 * @param req
 * @param res
 * @param next
 */
const getAddMultiplePupils = async (req, res, next) => {
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
    req.breadcrumbs('Pupil register', '/pupil-register/pupils-list')
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
}

/**
 * Save multiple pupils.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const postAddMultiplePupils = async (req, res, next) => {
  let school
  try {
    school = await schoolDataService.sqlFindOneById(req.user.schoolId)
    if (!school) {
      throw new Error(`School [${req.user.school}] not found`)
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
      return getAddMultiplePupils(req, res, next)
    }
  } catch (error) {
    return next(error)
  }

  let uploadResult
  try {
    uploadResult = await pupilUploadService.upload(school, uploadFile)
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
    return getAddMultiplePupils(req, res, next)
  } else {
    req.flash('info', `${uploadResult.pupilIds && uploadResult.pupilIds.length} new pupils have been added`)
    const savedPupils = await pupilDataService.sqlFindByIds(uploadResult.pupilIds, req.user.schoolId)
    const slugs = savedPupils.map(p => p.urlSlug)
    const qp = encodeURIComponent(JSON.stringify(slugs))
    res.redirect(`/pupil-register/pupils-list?hl=${qp}`)
  }
}

/**
 * Get error CSV file.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const getErrorCSVFile = async (req, res) => {
  const blobFile = await azureFileDataService.azureDownloadFile('csvuploads', req.session.csvErrorFile)
  res.setHeader('Content-type', 'text/csv')
  res.setHeader('Content-disposition', 'attachment; filename=multiple_pupils_errors.csv')
  res.write(blobFile)
  res.end()
}

/**
 * Get pupil by id.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const getEditPupilById = async (req, res, next) => {
  res.locals.pageTitle = 'Edit pupil data'
  let pupilExampleYear
  try {
    const pupil = await pupilDataService.sqlFindOneBySlugWithAgeReason(req.params.id, req.user.schoolId)
    pupilExampleYear = pupilPresenter.getPupilExampleYear()
    if (!pupil) {
      return next(new Error(`Pupil ${req.params.id} not found`))
    }

    const pupilData = pupilAddService.formatPupilData(pupil)

    req.breadcrumbs('Pupil register', '/pupil-register/pupils-list')
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
}

/**
 * Post pupil
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const postEditPupil = async (req, res, next) => {
  let pupil
  let school
  let validationError
  // In case we render an error page
  res.locals.pageTitle = 'Edit pupil data'

  try {
    pupil = await pupilDataService.sqlFindOneBySlugWithAgeReason(req.body.urlSlug, req.user.schoolId)
    if (!pupil) {
      return next(new Error(`Pupil ${req.body.urlSlug} not found`))
    }

    school = await schoolDataService.sqlFindOneById(pupil.school_id)
    if (!school) {
      return next(new Error('School not found'))
    }

    validationError = await pupilValidator.validate(req.body, school.id)
  } catch (error) {
    return next(error)
  }

  if (validationError.hasError()) {
    const pupilExampleYear = pupilPresenter.getPupilExampleYear()
    req.breadcrumbs('Pupil register', '/pupil-register/pupils-list')
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
    await pupilEditService.update(pupil, req.body, req.user.schoolId)
    req.flash('info', 'Changes to pupil details have been saved')
  } catch (error) {
    next(error)
  }
  const highlight = JSON.stringify([pupil.urlSlug.toString()])
  const successUrl = `/pupil-register/pupils-list?hl=${highlight}`
  const WaitTimeBeforeRedirectInSeconds = config.WaitTimeBeforeRedirectInSeconds
  res.render('redirect-delay.ejs', {
    url: successUrl,
    WaitTimeBeforeRedirectInSeconds: WaitTimeBeforeRedirectInSeconds
  })
}

module.exports = {
  getAddPupil,
  postAddPupil,
  getAddMultiplePupils,
  postAddMultiplePupils,
  getErrorCSVFile,
  getEditPupilById,
  postEditPupil
}
