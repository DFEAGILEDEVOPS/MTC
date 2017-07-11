const moment = require('moment')
const csv = require('fast-csv')

const Pupil = require('../models/pupil')
const School = require('../models/school')
const randomGenerator = require('../lib/random-generator')
const ValidationError = require('../lib/validation-error')
const errorConverter = require('../lib/error-converter')
const hdfErrorMessages = require('../lib/errors/hdf')
const hdfValidator = require('../lib/validator/hdf-validator')
const { fetchPupilsData, fetchPupilAnswers, fetchScoreDetails } = require('../services/pupilService')

const getHome = async (req, res, next) => {
  res.locals.pageTitle = 'School Homepage'
  let schoolName = ''

  try {
    const school = await School.findOne({'_id': req.user.School}).exec()
    if (!school) {
      return next(new Error(`School not found: ${req.user.School}`))
    }
    schoolName = school.name
  } catch (error) {
    return next(error)
  }
  return res.render('school/school-home', {
    schoolName,
    breadcrumbs: [{'name': 'School Home'}]
  })
}

const getResults = async (req, res, next) => {
  res.locals.pageTitle = 'Results'
  const {pupils, schoolData} = await fetchPupilsData(req.user.School)
  let pupilsFormatted = await Promise.all(pupils.map(async (p) => {
    const fullName = `${p.foreName} ${p.lastName}`
    const answers = await fetchPupilAnswers(p._id)
    const pupilScore = answers && answers.result
    const { hasScore, score, percentage } = await fetchScoreDetails(answers, pupilScore)
    return {
      fullName,
      hasScore,
      score,
      percentage
    }
  })).catch((error) => next(error))
  req.breadcrumbs(res.locals.pageTitle)
  pupilsFormatted = pupilsFormatted.filter((p) => p.hasScore)
  if ((schoolData.hdf && schoolData.hdf.signedDate) &&
    (typeof pupilsFormatted === 'object' && Object.keys(pupilsFormatted).length > 0)) {
    return res.render('school/results', {
      breadcrumbs: req.breadcrumbs(),
      pupils: pupilsFormatted,
      schoolData
    })
  } else {
    return res.render('school/no-results', {
      breadcrumbs: req.breadcrumbs()
    })
  }
}

const downloadResults = async (req, res, next) => {
  // TODO: refactor to make it smaller
  const csvStream = csv.createWriteStream()
  const {schoolData, pupils} = await fetchPupilsData(req.user.School)
  // Format the pupils
  let pupilsFormatted = await Promise.all(pupils.map(async (p) => {
    const fullName = `${p.foreName} ${p.lastName}`
    const dob = moment(p.dob).format('DD/MM/YYYY')
    const answersSet = await fetchPupilAnswers(p._id)
    if (!answersSet) return
    let answers = answersSet.answers && answersSet.answers.sort((a1, a2) => {
      const f1 = a1.factor1 - a2.factor1
      if (f1 !== 0) return f1
      return a1.factor2 - a2.factor2
    })
    answers = answers.map(a => {
      const question = `${a.factor1}x${a.factor2}`
      const pupilAnswer = a.input
      const answerMark = a.isCorrect ? 1 : 0
      return {
        question,
        pupilAnswer,
        answerMark
      }
    })
    const pupilScore = answersSet && answersSet.result
    if (!pupilScore || typeof pupilScore.correct !== 'number') return
    const totalMark = pupilScore && pupilScore.correct.toString()
    return {
      fullName,
      dob,
      answers,
      totalMark
    }
  })).catch((error) => next(error))
  pupilsFormatted = pupilsFormatted.filter((p) => p)
  const pupilStructure = pupilsFormatted[0]
  const csvContent = []
  const csvHeaders = ['Full Name', 'Date of Birth']
  // Generate the row headers
  pupilStructure.answers.forEach((answer, i) => {
    const question = `Question ${i + 1}`
    const input = `Answer ${i + 1}`
    const mark = `Mark ${i + 1}`
    csvHeaders.push(question, input, mark)
  })
  csvHeaders.push('Score')
  // Generate the pupils
  const csvPupils = []
  pupilsFormatted.forEach((p, i) => {
    csvPupils[i] = []
    Object.keys(p).forEach((k) => {
      if (k === 'answers') {
        p[k].forEach((a) => {
          Object.keys(a).forEach((ak) => csvPupils[i].push(a[ak].toString()))
        })
      } else {
        csvPupils[i].push(p[k])
      }
    })
  })
  csvContent.push(csvHeaders)
  csvPupils.forEach((p) => csvContent.push(p))
  const checkDate = moment(moment.now()).format('DD MMM YYYY')
  res.setHeader('Content-disposition', `attachment filename=Results ${schoolData.leaCode}${schoolData.estabCode} ${checkDate}.csv`)
  res.setHeader('content-type', 'text/csv')
  csvContent.forEach((row) => csvStream.write(row))
  csvStream.pipe(res)
  csvStream.end()
}

const generatePins = async (req, res, next) => {
  if (!req.body['pupil']) {
    console.error('generatePins: no pupils selected')
    // TODO: inform the user via flash message?
    return res.redirect('/school/manage-pupils')
  }
  const data = Object.values(req.body['pupil'] || null)
  const chars = '23456789bcdfghjkmnpqrstvwxyz'
  const length = 5
  let pupils

  // fetch pupils
  try {
    pupils = await Pupil.find({_id: data}).exec()
  } catch (error) {
    console.error('Failed to find pupils: ' + error.message)
    return next(error)
  }

  // Apply the updates to the pupil object(s)
  pupils.forEach(pupil => {
    if (!pupil.pin) {
      pupil.pin = randomGenerator.getRandom(length, chars)
      pupil.expired = false
    }
  })

  // Save our pupils, in parallel
  const promises = pupils.map(p => p.save()) // returns Promise

  Promise.all(promises).then(results => {
      // all pupils saved ok
    return res.redirect('/school/manage-pupils')
  },
    error => {
      // one or more promises were rejected
      // TODO: add a flash message informing the user
      console.error(error)
      return res.redirect('/school/manage-pupils')
    })
    .catch(error => {
      console.error(error)
      // TODO: add a flash message informing the user
      return res.redirect('/school/manage-pupils')
    })
}

const getSubmitAttendance = async (req, res, next) => {
  res.locals.pageTitle = 'Attendance register'
  req.breadcrumbs(res.locals.pageTitle)
  const {pupils, schoolData} = await fetchPupilsData(req.user.School)
  // Redirect to confirmation of submission if hdf has been signed
  if (schoolData.hdf && schoolData.hdf.signedDate) {
    return res.redirect('/school/declaration-form-submitted')
  }
  let pupilsFormatted = await Promise.all(pupils.map(async (p) => {
    const fullName = `${p.foreName} ${p.lastName}`
    const {_id: id, hasAttended} = p
    const answers = await fetchPupilAnswers(p._id)
    const pupilScore = answers && answers.result
    const { hasScore, percentage } = fetchScoreDetails(answers, pupilScore)
    return {
      id,
      fullName,
      hasAttended,
      hasScore,
      percentage
    }
  })).catch((error) => next(error))
  pupilsFormatted = pupilsFormatted.filter((p) => p.percentage !== 'n/a')
  // Redirect to declaration form if at least one has been submitted for attendance
  console.log(pupilsFormatted)
  if (pupilsFormatted.length > 0 && pupilsFormatted.some((p) => p.hasAttended)) {
    return res.redirect('/school/declaration-form')
  }
  return res.render('school/submit-attendance-register', {
    breadcrumbs: req.breadcrumbs(),
    pupils: pupilsFormatted
  })
}

const postSubmitAttendance = async (req, res, next) => {
  const attendees = req.body['attendee']
  if (!attendees) {
    return res.redirect('/school/submit-attendance')
  }
  const data = Object.values(req.body['attendee'] || null)
  let selected
  const { pupils } = await fetchPupilsData(req.user.School)
  try {
    selected = await Pupil.find({_id: data}).exec()
  } catch (error) {
    return next(error)
  }
  // Update attendance for selected pupils
  selected.forEach((p) => (p.hasAttended = true))
  const selectedPromises = selected.map(s => s.save())
  // Expire all pins for school pupils
  pupils.forEach(p => (p.pinExpired = true))
  const pupilsPromises = pupils.map(p => p.save())
  Promise.all([selectedPromises, pupilsPromises]).then(() => {
    return res.redirect('/school/declaration-form')
  },
    error => next(error))
    .catch(error => next(error)
    )
}

const getDeclarationForm = async (req, res, next) => {
  const {schoolData} = await fetchPupilsData(req.user.School)
  if (schoolData.hdf && schoolData.hdf.signedDate) {
    return res.redirect('/school/declaration-form-submitted')
  }
  req.body['fullName'] = req.user && req.user['UserName']
  res.locals.pageTitle = 'Headteacher\'s declaration form'
  req.breadcrumbs('Attendance register')
  req.breadcrumbs(res.locals.pageTitle)
  return res.render('school/declaration-form', {
    formData: req.body,
    error: new ValidationError(),
    breadcrumbs: req.breadcrumbs()
  })
}

const postDeclarationForm = async (req, res, next) => {
  const {jobTitle, fullName, declaration} = req.body
  const school = await School.findOne({'_id': req.user.School}).exec()
  school.hdf = {
    signedDate: Date.now(),
    declaration,
    jobTitle,
    fullName
  }
  let validationError = await hdfValidator.validate(req)
  try {
    await school.validate()
    if (validationError.hasError()) {
      throw new Error('school validation error')
    }
  } catch (error) {
    res.locals.pageTitle = 'Headteacher\'s declaration form'
    req.breadcrumbs(res.locals.pageTitle)
    if (error.message !== 'school validation error') {
      const combinedValidationError = errorConverter.fromMongoose(error, hdfErrorMessages, validationError)
      return res.render('school/declaration-form', {
        formData: req.body,
        error: combinedValidationError,
        breadcrumbs: req.breadcrumbs()
      })
    }
    return res.render('school/declaration-form', {
      formData: req.body,
      error: validationError,
      breadcrumbs: req.breadcrumbs()
    })
  }
  try {
    await school.save()
  } catch (error) {
    return next(error)
  }
  return res.redirect('/school/declaration-form-submitted')
}

const getHDFSubmitted = async (req, res, next) => {
  res.locals.pageTitle = 'Headteacher\'s declaration form submitted'
  req.breadcrumbs(res.locals.pageTitle)
  let school
  try {
    school = await School.findOne({'_id': req.user.School}).exec()
  } catch (error) {
    return next(error)
  }
  const {hdf: {signedDate}} = school
  return res.render('school/declaration-form-submitted', {
    breadcrumbs: req.breadcrumbs(),
    signedDate: signedDate && moment(signedDate).format('Do MMMM YYYY')
  })
}

module.exports = {
  getHome,
  getResults,
  downloadResults,
  generatePins,
  getSubmitAttendance,
  postSubmitAttendance,
  getDeclarationForm,
  postDeclarationForm,
  getHDFSubmitted
}
