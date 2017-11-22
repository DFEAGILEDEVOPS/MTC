const moment = require('moment')
const School = require('../models/school')
const Pupil = require('../models/pupil')
const errorConverter = require('../lib/error-converter')
const ValidationError = require('../lib/validation-error')
const addPupilErrorMessages = require('../lib/errors/pupil').addPupil
const pupilValidator = require('../lib/validator/pupil-validator')
const fileValidator = require('../lib/validator/file-validator')
const pupilService = require('../services/pupil.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const azureFileDataService = require('../services/data-access/azure-file.data.service')
const pupilUploadService = require('../services/pupil-upload.service')
const schoolDataService = require('../services/data-access/school.data.service')

const getAddPupil = async (req, res, next) => {
  res.locals.pageTitle = 'Add single pupil'
  // school id from session
  const schoolId = req.user.School
  const school = await schoolDataService.findOne({_id: schoolId})
  if (!school) {
    throw new Error(`School [${schoolId}] not found`)
  }

  try {
    req.breadcrumbs('Pupil Register', '/school/pupil-register/lastName/true')
    req.breadcrumbs(res.locals.pageTitle)
    res.render('school/add-pupil', {
      school: school,
      error: new ValidationError(),
      breadcrumbs: req.breadcrumbs()
    })
  } catch (error) {
    next(error)
  }
}

const postAddPupil = async (req, res, next) => {
  res.locals.pageTitle = 'Add pupil'
  req.breadcrumbs(res.locals.pageTitle)
  let school
  try {
    school = await School.findOne({_id: req.body.school}).exec()
    if (!school) {
      throw new Error(`School [${req.body.school}] not found`)
    }
  } catch (error) {
    return next(error)
  }
  const pupil = new Pupil({
    school: school._id,
    upn: req.body.upn && req.body.upn.trim().toUpperCase(),
    foreName: req.body.foreName,
    lastName: req.body.lastName,
    middleNames: req.body.middleNames,
    gender: req.body.gender,
    dob: moment.utc('' + req.body['dob-day'] + '/' + req.body['dob-month'] + '/' + req.body['dob-year'], 'DD/MM/YYYY'),
    pin: null,
    pinExpired: false
  })
  try {
    const pupilData = req.body
    await pupilService.validatePupil(pupil, pupilData)
  } catch (error) {
    Object.keys(error.errors).forEach((e) => { error.errors[e] = error.errors[e] })
    return res.render('school/add-pupil', {
      school: school.toJSON(),
      formData: req.body,
      error: error,
      breadcrumbs: req.breadcrumbs()
    })
  }
  try {
    await pupil.save()
    req.flash('info', '1 new pupil has been added')
  } catch (error) {
    next(error)
  }
  const pupilId = JSON.stringify([pupil._id])
  res.redirect(`/school/pupil-register/lastName/true?hl=${pupilId}`)
}

const getAddMultiplePupils = (req, res, next) => {
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

const postAddMultiplePupils = async (req, res, next) => {
  let school
  try {
    school = await School.findOne({_id: req.user.School}).exec()
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
    return getAddMultiplePupils(req, res, next)
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
    return getAddMultiplePupils(req, res, next)
  } else {
    req.flash('info', `${csvUploadResult.pupils && csvUploadResult.pupils.length} new pupils have been added`)
    const ids = JSON.stringify(csvUploadResult.pupilIds)
    res.redirect(`/school/pupil-register/lastName/true?hl=${ids}`)
  }
}

const getAddMultiplePupilsCSVTemplate = async (req, res) => {
  const file = 'assets/csv/MTC-Pupil-details-template-Sheet-1.csv'
  res.download(file)
}

const getErrorCSVFile = async (req, res) => {
  const blobFile = await azureFileDataService.azureDownloadFile('csvuploads', req.session.csvErrorFile)
  res.setHeader('Content-disposition', 'filename=multiple_pupils_errors.csv')
  res.setHeader('content-type', 'text/csv')
  res.write(blobFile)
  res.end()
}

const getEditPupilById = async (req, res, next) => {
  res.locals.pageTitle = 'Edit pupil data'
  try {
    const pupil = await Pupil.findOne({_id: req.params.id}).exec()
    if (!pupil) {
      return next(new Error(`Pupil ${req.body.id} not found`))
    }
    const school = await School.findOne({_id: pupil.school}).exec()
    if (!school) {
      return next(new Error(`School ${pupil.school} not found`))
    }
    const pupilData = pupil.toJSON()
    const dob = moment(pupil.dob)
    // expand single date field to 3
    delete pupilData['dob']
    pupilData['dob-day'] = dob.format('D')
    pupilData['dob-month'] = dob.format('M')
    pupilData['dob-year'] = dob.format('YYYY')
    req.breadcrumbs(res.locals.pageTitle)
    res.render('school/edit-pupil', {
      school: school.toJSON(),
      formData: pupilData,
      error: new ValidationError(),
      breadcrumbs: req.breadcrumbs()
    })
  } catch (error) {
    next(error)
  }
}

const postEditPupil = async (req, res, next) => {
  let pupil
  let school
  let validationError
  // In case we render an error page
  res.locals.pageTitle = 'Edit pupil data'

  try {
    pupil = await Pupil.findOne({_id: req.body._id}).exec()
    if (!pupil) {
      return next(new Error(`Pupil ${req.body.id} not found`))
    }
    school = await School.findOne({_id: pupil.school}).exec()
    if (!school) {
      return next(new Error(`School ${pupil.school} not found`))
    }
    validationError = await pupilValidator.validate(req.body)
  } catch (error) {
    return next(error)
  }

  pupil.foreName = req.body.foreName
  pupil.middleNames = req.body.middleNames
  pupil.lastName = req.body.lastName
  pupil.upn = req.body.upn.trim().toUpperCase()
  pupil.gender = req.body.gender
  pupil.pin = pupil.pin || null
  pupil.pinExpired = pupil.pinExpired || false
  pupil.dob = moment.utc('' + req.body['dob-day'] + '/' + req.body['dob-month'] + '/' + req.body['dob-year'], 'DD/MM/YYYY')

  try {
    await pupil.validate()
    if (validationError.hasError()) {
      throw new Error('custom validation error')
    }
  } catch (error) {
    req.breadcrumbs(res.locals.pageTitle)

    if (error.message !== 'custom validation error') {
      // Mongoose error
      // At this point we have validated the schema and may or may not have anything in validationError
      // So = combine all validation errors into one
      let combinedValidationError = errorConverter.fromMongoose(error, addPupilErrorMessages, validationError)
      // error fixup: if the mongoose schema bails out on the dob field - we should make sure we have some
      // actual html fields that have an error.  If we do, we can ditch the mongoose error as being superfluous.
      if (combinedValidationError.isError('dob') && (combinedValidationError.isError('dob-day') || combinedValidationError.isError('dob-month') || combinedValidationError.isError('dob-year'))) {
        combinedValidationError.removeError('dob')
      }
      return res.render('school/edit-pupil', {
        school: school.toJSON(),
        formData: req.body,
        error: combinedValidationError,
        breadcrumbs: req.breadcrumbs()
      })
    }

    return res.render('school/edit-pupil', {
      school: school.toJSON(),
      formData: req.body,
      error: validationError,
      breadcrumbs: req.breadcrumbs()
    })
  }

  try {
    await pupil.save()
    req.flash('info', 'Changes to pupil details have been saved')
  } catch (error) {
    next(error)
  }

  // pupil saved
  const pupilId = JSON.stringify([pupil._id])
  res.redirect(`/school/pupil-register/lastName/true?hl=${pupilId}`)
}

const getPrintPupils = async (req, res, next) => {
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

module.exports = {
  getAddPupil,
  postAddPupil,
  getAddMultiplePupils,
  postAddMultiplePupils,
  getAddMultiplePupilsCSVTemplate,
  getErrorCSVFile,
  getEditPupilById,
  postEditPupil,
  getPrintPupils
}
