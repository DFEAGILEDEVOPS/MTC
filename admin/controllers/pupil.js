'use strict'

const azureFileDataService = require('../services/data-access/azure-file.data.service')
const dateService = require('../services/date.service')
const fileValidator = require('../lib/validator/file-validator')
const pupilAddService = require('../services/pupil-add-service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const pupilService = require('../services/pupil.service')
const pupilUploadService = require('../services/pupil-upload.service')
const pupilValidator = require('../lib/validator/pupil-validator')
const R = require('ramda')
const schoolDataService = require('../services/data-access/school.data.service')
const ValidationError = require('../lib/validation-error')
const winston = require('winston')

const controller = {}

controller.getAddPupil = async (req, res, next, error = null) => {
  res.locals.pageTitle = 'Add pupil'
  try {
    req.breadcrumbs('Pupil Register', '/school/pupil-register/lastName/true')
    req.breadcrumbs(res.locals.pageTitle)
    res.render('school/add-pupil', {
      formData: req.body,
      error: error || new ValidationError(),
      breadcrumbs: req.breadcrumbs()
    })
  } catch (error) {
    next(error)
  }
}

controller.postAddPupil = async (req, res, next) => {
  res.locals.pageTitle = 'Add pupil'
  try {
    const school = await schoolDataService.sqlFindOneByDfeNumber(req.user.School)
    const pupilData = {
      school_id: school.id,
      upn: req.body.upn,
      foreName: req.body.foreName,
      lastName: req.body.lastName,
      middleNames: req.body.middleNames,
      gender: req.body.gender,
      'dob-month': req.body['dob-month'],
      'dob-day': req.body['dob-day'],
      'dob-year': req.body['dob-year']
    }
    const pupil = await pupilAddService.addPupil(pupilData)
    req.flash('info', '1 new pupil has been added')
    const highlight = JSON.stringify([pupil.urlSlug.toString()])
    res.redirect(`/school/pupil-register/lastName/true?hl=${highlight}`)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return controller.getAddPupil(req, res, next, error)
    }
    winston.warn(error)
    next(error)
  }
}

controller.getAddMultiplePupils = (req, res, next) => {
  res.locals.pageTitle = 'Add multiple pupils'
  const { hasError, fileErrors } = res
  try {
    req.breadcrumbs('Pupil Register', '/school/pupil-register/lastName/true')
    req.breadcrumbs(res.locals.pageTitle)
    res.render('school/add-multiple-pupils', {
      breadcrumbs: req.breadcrumbs(),
      hasError,
      fileErrors
    })
  } catch (error) {
    next(error)
  }
}

controller.postAddMultiplePupils = async (req, res, next) => {
  let school
  try {
    school = await schoolDataService.sqlFindOneByDfeNumber(req.user.School)
    if (!school) {
      throw new Error(`School [${req.user.school}] not found`)
    }
  } catch (error) {
    return next(error)
  }
  const uploadFile = req.files && req.files.csvTemplateFile
  const fileErrors = await fileValidator.validate(uploadFile, 'file-upload')
  if (fileErrors.hasError()) {
    res.hasError = true
    res.fileErrors = fileErrors
    return controller.getAddMultiplePupils(req, res, next)
  }
  let uploadResult
  try {
    uploadResult = await pupilUploadService.upload(school, uploadFile)
  } catch (error) {
    return next(error)
  }
  // upload error
  if (uploadResult.error) return next(uploadResult.error)
  // render with errors
  if (uploadResult.hasValidationError) {
    req.session.csvErrorFile = uploadResult.csvErrorFile
    res.hasError = uploadResult.hasValidationError
    res.fileErrors = uploadResult.fileErrors
    return controller.getAddMultiplePupils(req, res, next)
  } else {
    req.flash('info', `${uploadResult.pupilIds && uploadResult.pupilIds.length} new pupils have been added`)
    const savedPupils = await pupilDataService.sqlFindByIds(uploadResult.pupilIds)
    const slugs = savedPupils.map(p => p.urlSlug)
    const qp = encodeURIComponent(JSON.stringify(slugs))
    res.redirect(`/school/pupil-register/lastName/true?hl=${qp}`)
  }
}

controller.getAddMultiplePupilsCSVTemplate = async (req, res) => {
  const file = 'public/CSVs/MTC-Pupil-details-template-Sheet-1.csv'
  res.download(file)
}

controller.getErrorCSVFile = async (req, res) => {
  const blobFile = await azureFileDataService.azureDownloadFile('csvuploads', req.session.csvErrorFile)
  res.setHeader('Content-disposition', 'filename=multiple_pupils_errors.csv')
  res.setHeader('content-type', 'text/csv')
  res.write(blobFile)
  res.end()
}

controller.getEditPupilById = async (req, res, next) => {
  res.locals.pageTitle = 'Edit pupil data'
  try {
    const pupil = await pupilDataService.sqlFindOneBySlug(req.params.id)
    if (!pupil) {
      return next(new Error(`Pupil ${req.params.id} not found`))
    }
    const school = await schoolDataService.sqlFindOneById(pupil.school_id)
    if (!school) {
      return next(new Error(`School ${pupil.school._id} not found`))
    }
    const pupilData = R.omit('dateOfBirth', pupil)
    // expand single date field to 3
    pupilData['dob-day'] = pupil.dateOfBirth.format('D')
    pupilData['dob-month'] = pupil.dateOfBirth.format('M')
    pupilData['dob-year'] = pupil.dateOfBirth.format('YYYY')
    req.breadcrumbs(res.locals.pageTitle)
    res.render('school/edit-pupil', {
      formData: pupilData,
      error: new ValidationError(),
      breadcrumbs: req.breadcrumbs()
    })
  } catch (error) {
    next(error)
  }
}

controller.postEditPupil = async (req, res, next) => {
  let pupil
  let school
  let validationError
  // In case we render an error page
  res.locals.pageTitle = 'Edit pupil data'

  try {
    pupil = await pupilDataService.sqlFindOneBySlug(req.body.urlSlug)
    if (!pupil) {
      return next(new Error(`Pupil ${req.body.urlSlug} not found`))
    }
    school = await schoolDataService.sqlFindOneById(pupil.school_id)
    if (!school) {
      return next(new Error(`School not found`))
    }
    validationError = await pupilValidator.validate(req.body)
  } catch (error) {
    return next(error)
  }

  if (validationError.hasError()) {
    req.breadcrumbs(res.locals.pageTitle)
    return res.render('school/edit-pupil', {
      school,
      formData: req.body,
      error: validationError,
      breadcrumbs: req.breadcrumbs()
    })
  }

  const trimAndUppercase = R.compose(R.toUpper, R.trim)

  const update = {
    id: pupil.id,
    foreName: req.body.foreName,
    middleNames: req.body.middleNames,
    lastName: req.body.lastName,
    upn: trimAndUppercase(R.pathOr('', ['body', 'upn'], req)),
    gender: req.body.gender,
    dateOfBirth: dateService.createFromDayMonthYear(req.body['dob-day'], req.body['dob-month'], req.body['dob-year'])
  }
  try {
    await pupilDataService.sqlUpdate(update)
    req.flash('info', 'Changes to pupil details have been saved')
  } catch (error) {
    next(error)
  }

  // pupil saved - redirect and highlight the saved pupil
  const highlight = JSON.stringify([pupil.urlSlug.toString()])
  res.redirect(`/school/pupil-register/lastName/true?hl=${highlight}`)
}

/**
 * Print the pupil and school pins
 */
controller.getPrintPupils = async (req, res, next) => {
  res.locals.pageTitle = 'Print pupils'
  try {
    const pupilData = await pupilService.getPrintPupils(req.user.School)
    res.render('school/pupils-print', {
      pupils: pupilData
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = controller
