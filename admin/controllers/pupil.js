const moment = require('moment')
const uuidv4 = require('uuid/v4')
const fs = require('fs-extra')
const csv = require('fast-csv')
const { promisify } = require('bluebird')
const azure = require('azure-storage')
const blobService = azure.createBlobService()
const School = require('../models/school')
const Pupil = require('../models/pupil')
const errorConverter = require('../lib/error-converter')
const ValidationError = require('../lib/validation-error')
const addPupilErrorMessages = require('../lib/errors/pupil').addPupil
const pupilValidator = require('../lib/validator/pupil-validator')
const { fetchPupilsData, fetchPupilAnswers, fetchScoreDetails, validatePupil } = require('../services/pupil.service')

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
    req.breadcrumbs('Pupil Register', '/school/pupil-register/lastName/true')
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
    const pupilData = req.body
    await validatePupil(pupil, pupilData)
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
    req.flash('info', 'Changes to pupil details have been saved')
  } catch (error) {
    next(error)
  }
  const pupilId = JSON.stringify([pupil._id])
  res.redirect(`/school/pupil-register/lastName/true?hl=${pupilId}`)
}

const getAddMultiplePupils = (req, res, next) => {
  res.locals.pageTitle = 'Add multiple pupils'
  const { hasError } = res
  try {
    req.breadcrumbs('Pupil Register', '/school/pupil-register/lastName/true')
    req.breadcrumbs(res.locals.pageTitle)
    res.render('school/add-multiple-pupils', {
      breadcrumbs: req.breadcrumbs(),
      hasError
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
  const uploadFile = req.files.csvTemplateFile
  let csvData = []
  const stream = fs.createReadStream(uploadFile.file)
  const csvStream = csv()
    .on('data', (data) => { csvData.push(data) })
    .on('end', async() => {
      // Remove error column and headers from data
      if (csvData.some(p => p[6])) csvData.map((r) => r.splice(6, 1))
      let headers = csvData.shift(0)
      // validate each pupil
      const pupils = []
      csvData = await Promise.all(csvData.map(async(p) => {
        const pupil = new Pupil({
          school: school._id,
          upn: p[3],
          foreName: p[0],
          lastName: p[2],
          middleNames: p[1],
          gender: p[5],
          dob: p[4],
          pin: null,
          pinExpired: false
        })
        try {
          const dob = p[4].split('/')
          const pupilData = Object.assign({
            'dob-day': dob[1],
            'dob-month': dob[0],
            'dob-year': dob[2]
          }, pupil._doc)
          await validatePupil(pupil, pupilData)
        } catch (err) {
          p[6] = []
          Object.keys(err.errors).forEach((e) => p[6].push(err.errors[e]))
          p[6] = p[6].join(', ')
        }
        pupils.push(pupil)
        return p
      }))
      // Generate csv with errors
      if (csvData.some(p => p[6])) {
        const errorsCsv = []
        headers.push('Errors')
        errorsCsv.push(headers)
        csvData.forEach((p) => errorsCsv.push(p))
        const writeToString = promisify(csv.writeToString)
        const cvsStr = await writeToString(errorsCsv, { headers: true })
        // Upload csv to Azure
        try {
          const remoteFilename = `${school._id}_${uuidv4()}_${moment().format('YYYYMMDDHHmmss')}_error.csv`
          const streamLength = 512 * 1000
          const csvBlobFile = await new Promise((resolve, reject) => {
            blobService.createBlockBlobFromText('csvuploads', remoteFilename, cvsStr, streamLength,
              (error, result) => {
                if (error) reject(error)
                else return resolve(result)
              }
            )
          })
          req.session.csvErrorFile = csvBlobFile.name
        } catch (err) {
          return next(err)
        }
        // render with errors
        res.hasError = true
        getAddMultiplePupils(req, res, next)
      // Save pupils if validation succeeds
      } else {
        let pupilIds = []
        try {
          const savedPupils = await Pupil.insertMany(pupils, (err) => {
            if (err) {
              throw new Error(err)
            }
          })
          savedPupils.map((p) => pupilIds.push(p._id))
          req.flash('info', `${pupils.length} new pupils have been added`)
        } catch (err) {
          return next(err)
        }
        pupilIds = JSON.stringify(pupilIds)
        res.redirect(`/school/pupil-register/lastName/true?hl=${pupilIds}`)
      }
    })
  stream.pipe(csvStream)
}

const getAddMultiplePupilsCSVTemplate = async (req, res) => {
  const file = 'assets/csv/multiple_pupils_template.csv'
  res.download(file)
}

const getErrorCSVFile = async (req, res) => {
  const blobFile = await new Promise((resolve, reject) => {
    blobService.getBlobToText('csvuploads', req.session.csvErrorFile,
      (error, result) => {
        if (error) reject(error)
        else return resolve(result)
      }
    )
  })
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
    req.flash('info', 'Changes to pupil details have been saved')
  } catch (error) {
    next(error)
  }

  // pupil saved
  const pupilId = JSON.stringify([pupil._id])
  res.redirect(`/school/pupil-register/lastName/true?hl=${pupilId}`)
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
  getAddMultiplePupils,
  postAddMultiplePupils,
  getAddMultiplePupilsCSVTemplate,
  getErrorCSVFile,
  getEditPupilById,
  postEditPupil,
  getManagePupils,
  getPrintPupils
}
