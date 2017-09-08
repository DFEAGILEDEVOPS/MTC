const moment = require('moment')

const School = require('../models/school')
const Pupil = require('../models/pupil')
const errorConverter = require('../lib/error-converter')
const ValidationError = require('../lib/validation-error')
const addPupilErrorMessages = require('../lib/errors/pupil').addPupil
const pupilValidator = require('../lib/validator/pupil-validator')
const { fetchPupilsData, fetchPupilAnswers, fetchScoreDetails } = require('../services/pupilService')

const getAddPupil = async (req, res, next) => {
  res.locals.pageTitle = 'Add single pupil'
  // school id from session
  const schoolId = req.user.School
  let school

  try {
    school = await School.findOne({_id: schoolId}).exec()
    if (!school) {
      throw new Error(`School [${schoolId}] not found`)
    }
  } catch (error) {
    return next(error)
  }

  try {
    req.breadcrumbs(res.locals.pageTitle)

    res.render('school/add-pupil', {
      school: school.toJSON(),
      error: new ValidationError(),
      breadcrumbs: req.breadcrumbs()
    })
  } catch (error) {
    next(error)
  }
}

const postAddPupil = async (req, res, next) => {
  res.locals.pageTitle = 'Add pupil'
  let school
  try {
    school = await School.findOne({_id: req.body.school}).exec()
    if (!school) {
      throw new Error(`School [${req.body.school}] not found`)
    }
  } catch (error) {
    return next(error)
  }
  let validationError = await pupilValidator.validate(req)
  const pupil = new Pupil({
    school: school._id,
    upn: req.body.upn,
    foreName: req.body.foreName,
    lastName: req.body.lastName,
    middleNames: req.body.middleNames,
    gender: req.body.gender,
    dob: moment.utc('' + req.body['dob-day'] + '/' + req.body['dob-month'] + '/' + req.body['dob-year'], 'DD/MM/YYYY'),
    pin: null,
    pinExpired: false
  })
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
      return res.render('school/add-pupil', {
        school: school.toJSON(),
        formData: req.body,
        error: combinedValidationError,
        breadcrumbs: req.breadcrumbs()
      })
    }
    return res.render('school/add-pupil', {
      school: school.toJSON(),
      formData: req.body,
      error: validationError,
      breadcrumbs: req.breadcrumbs()
    })
  }
  try {
    await pupil.save()
  } catch (error) {
    next(error)
  }
  res.redirect('/school/manage-pupils')
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

const getEditPupil = async (req, res, next) => {
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
    validationError = await pupilValidator.validate(req)
  } catch (error) {
    return next(error)
  }

  pupil.foreName = req.body.foreName
  pupil.middleNames = req.body.middleNames
  pupil.lastName = req.body.lastName
  pupil.upn = req.body.upn
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
  } catch (error) {
    next(error)
  }

  // pupil saved
  // TODO: add flash message
  res.redirect('/school/manage-pupils')
}

const getManagePupils = async (req, res) => {
  res.locals.pageTitle = 'Manage pupils'
  const {pupils, schoolData} = await fetchPupilsData(req.user.School)
  let pupilsData = pupils.map(e => e.toJSON())

  // Format DOB
  pupilsData = await Promise.all(pupilsData.map(async (item) => {
    const dob = new Date(item.dob)
    item['dob'] = dob.getDate() + '/' + (dob.getMonth() + 1) + '/' + dob.getFullYear()
    const answers = await fetchPupilAnswers(item._id)
    const { hasScore, percentage } = fetchScoreDetails(answers)
    item.hasScore = hasScore
    item.percentage = percentage
    return item
  }))
  req.breadcrumbs(res.locals.pageTitle)
  return res.render('school/manage-pupils', {
    pupils: pupilsData,
    schoolPin: schoolData.schoolPin,
    todayDate: new Date(),
    breadcrumbs: req.breadcrumbs()
  })
}

const getPrintPupils = async (req, res, next) => {
  res.locals.pageTitle = 'Print pupils'
  let pupilsFormatted
  try {
    const {pupils, schoolData} = await fetchPupilsData(req.user.School)
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
  getEditPupilById,
  getEditPupil,
  getManagePupils,
  getPrintPupils
}
