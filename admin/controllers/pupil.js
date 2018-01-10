'use strict'

const moment = require('moment')
const R = require('ramda')
const azureFileDataService = require('../services/data-access/azure-file.data.service')
const dateService = require('../services/date.service')
const fileValidator = require('../lib/validator/file-validator')
const pupilAddService = require('../services/pupil-add-service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const pupilUploadService = require('../services/pupil-upload.service')
const pupilValidator = require('../lib/validator/pupil-validator')
const schoolDataService = require('../services/data-access/school.data.service')
const ValidationError = require('../lib/validation-error')

const controller = {}

controller.getAddPupil = async (req, res, next, error = null) => {
  res.locals.pageTitle = 'Add single pupil'
  // school id from session
  const schoolId = req.user.School
  const school = await schoolDataService.sqlFindOneByDfeNumber(schoolId)
  if (!school) {
    throw new Error(`School [${schoolId}] not found`)
  }

  try {
    req.breadcrumbs('Pupil Register', '/school/pupil-register/lastName/true')
    req.breadcrumbs(res.locals.pageTitle)
    res.render('school/add-pupil', {
      school: school,
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
  req.breadcrumbs(res.locals.pageTitle)
  const pupilData = {
    school: req.body.school,
    upn: req.body.upn && req.body.upn.trim().toUpperCase(),
    foreName: req.body.foreName,
    lastName: req.body.lastName,
    middleNames: req.body.middleNames,
    gender: req.body.gender,
    'dob-month': req.body['dob-month'],
    'dob-day': req.body['dob-day'],
    'dob-year': req.body['dob-year'],
    pin: null,
    pinExpired: false
  }
  try {
    const pupil = await pupilAddService.addPupil(pupilData)
    req.flash('info', '1 new pupil has been added')
    const json = JSON.stringify([pupil._id])
    res.redirect(`/school/pupil-register/lastName/true?hl=${json}`)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return controller.getAddPupil(req, res, next, error)
    }
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
  const fileErrors = await fileValidator.validate(uploadFile, 'template-upload')
  if (fileErrors.hasError()) {
    res.hasError = true
    res.fileErrors = fileErrors
    return controller.getAddMultiplePupils(req, res, next)
  }
  let csvUploadResult
  try {
    csvUploadResult = await pupilUploadService.upload(school, uploadFile)
  } catch (error) {
    return next(error)
  }
  // upload error
  if (csvUploadResult.error) return next(csvUploadResult.error)
  // render with errors
  if (csvUploadResult.hasValidationError) {
    req.session.csvErrorFile = csvUploadResult.csvErrorFile
    res.hasError = csvUploadResult.hasValidationError
    res.fileErrors = csvUploadResult.fileErrors
    return controller.getAddMultiplePupils(req, res, next)
  } else {
    req.flash('info', `${csvUploadResult.pupils && csvUploadResult.pupils.length} new pupils have been added`)
    const ids = JSON.stringify(csvUploadResult.pupilIds)
    res.redirect(`/school/pupil-register/lastName/true?hl=${ids}`)
  }
}

controller.getAddMultiplePupilsCSVTemplate = async (req, res) => {
  const file = 'assets/csv/MTC-Pupil-details-template-Sheet-1.csv'
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
    const pupil = await pupilDataService.findOne({_id: req.params.id})
    if (!pupil) {
      return next(new Error(`Pupil ${req.params.id} not found`))
    }
    const school = await schoolDataService.sqlFindOneByDfeNumber(pupil.school._id)
    if (!school) {
      return next(new Error(`School ${pupil.school._id} not found`))
    }
    const pupilData = R.omit('dob', pupil)
    const dob = moment(pupil.dob)
    // expand single date field to 3
    pupilData['dob-day'] = dob.format('D')
    pupilData['dob-month'] = dob.format('M')
    pupilData['dob-year'] = dob.format('YYYY')
    req.breadcrumbs(res.locals.pageTitle)
    res.render('school/edit-pupil', {
      school,
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
    pupil = await pupilDataService.findOne({_id: req.body._id})
    if (!pupil) {
      return next(new Error(`Pupil ${req.body._id} not found`))
    }
    school = await schoolDataService.sqlFindOneByDfeNumber(pupil.school._id)
    if (!school) {
      return next(new Error(`School ${pupil.school._id} not found`))
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

  pupil._id = req.body._id
  pupil.foreName = req.body.foreName
  pupil.middleNames = req.body.middleNames
  pupil.lastName = req.body.lastName
  pupil.upn = trimAndUppercase(R.pathOr('', ['body', 'upn'], req))
  pupil.gender = req.body.gender
  pupil.pin = pupil.pin || null
  pupil.pinExpired = pupil.pinExpired || false
  pupil.dob = dateService.createFromDayMonthYear(req.body['dob-day'], req.body['dob-month'], req.body['dob-year'])

  try {
    await pupilDataService.update({_id: pupil._id}, pupil)
    req.flash('info', 'Changes to pupil details have been saved')
  } catch (error) {
    // TODO: handle mongoose validation error?
    next(error)
  }

  // pupil saved - redirect and highlight the saved pupil
  const pupilId = JSON.stringify([pupil._id])
  res.redirect(`/school/pupil-register/lastName/true?hl=${pupilId}`)
}

controller.getPrintPupils = async (req, res, next) => {
  res.locals.pageTitle = 'Print pupils'
  let pupilsFormatted
  try {
    const {pupils, schoolData} = await pupilDataService.getPupils(req.user.School)
    const pupilsData = pupils.map(e => e.toJSON()).filter(p => !!p.pin && !p.pinExpired)
    pupilsFormatted = pupilsData.map(p => {
      return {
        fullName: `${p.foreName} ${p.lastName}`,
        schoolPin: schoolData.schoolPin,
        pupilPin: p.pin
      }
    })
  } catch (error) {
    return next(error)
  }
  res.render('school/pupils-print', {
    pupils: pupilsFormatted
  })
}

module.exports = controller
