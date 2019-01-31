'use strict'

const csv = require('fast-csv')
const moment = require('moment')

const dateService = require('../services/date.service')
const hdfValidator = require('../lib/validator/hdf-validator')
const hdfConfirmValidator = require('../lib/validator/hdf-confirm-validator')
const headteacherDeclarationService = require('../services/headteacher-declaration.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const pupilPresenter = require('../helpers/pupil-presenter')
const schoolDataService = require('../services/data-access/school.data.service')
const scoreService = require('../services/score.service')
const ValidationError = require('../lib/validation-error')
const attendanceCodeService = require('../services/attendance.service')

const getResults = async (req, res, next) => {
  res.locals.pageTitle = 'Results'
  const pupils = await pupilDataService.sqlFindPupilsByDfeNumber(req.user.School)
  const school = await schoolDataService.sqlFindOneByDfeNumber(req.user.school)
  let pupilsFormatted = await Promise.all(pupils.map(async (p) => {
    const fullName = `${p.foreName} ${p.lastName}`
    const score = await scoreService.getScorePercentage(p.id)
    const hasScore = (score !== undefined)
    return {
      fullName,
      hasScore,
      score,
      urlSlug: p.urlSlug
    }
  })).catch((error) => next(error))
  req.breadcrumbs(res.locals.pageTitle)
  pupilsFormatted = pupilsFormatted.filter((p) => p.hasScore)

  if (headteacherDeclarationService.isHdfSubmittedForCurrentCheck() &&
    (typeof pupilsFormatted === 'object' && Object.keys(pupilsFormatted).length > 0)) {
    return res.render('school/results', {
      breadcrumbs: req.breadcrumbs(),
      pupils: pupilsFormatted,
      school
    })
  } else {
    return res.render('school/no-results', {
      breadcrumbs: req.breadcrumbs()
    })
  }
}

// TODO: refactor this into a service call
const downloadResults = async (req, res, next) => {
  // TODO: refactor to make it smaller
  const csvStream = csv.createWriteStream()
  const pupils = await pupilDataService.sqlFindPupilsByDfeNumber(req.user.School)
  const schoolData = await schoolDataService.sqlFindOneById(pupils[0].school_id)
  // Format the pupils
  let pupilsFormatted = await Promise.all(pupils.map(async (p) => {
    const fullName = `${p.foreName} ${p.lastName}`
    const dob = dateService.formatUKDate(p.dateOfBirth)
    const answersSet = null // await pupilService.fetchAnswers(p.id) // method has been removed!
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
  const pupilStructure = pupilsFormatted[ 0 ]
  const csvContent = []
  const csvHeaders = [ 'Full Name', 'Date of Birth' ]
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
    csvPupils[ i ] = []
    Object.keys(p).forEach((k) => {
      if (k === 'answers') {
        p[ k ].forEach((a) => {
          Object.keys(a).forEach((ak) => csvPupils[ i ].push(a[ ak ].toString()))
        })
      } else {
        csvPupils[ i ].push(p[ k ])
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

const getReviewPupilDetails = async (req, res, next) => {
  res.locals.pageTitle = 'Review pupil details'
  req.breadcrumbs("Headteacher's declaration form", '/attendance/declaration-form')
  req.breadcrumbs(res.locals.pageTitle)
  const pupils = await headteacherDeclarationService.findPupilsForSchool(req.user.School)
  if (!pupils) {
    throw new Error('No pupils found')
  }
  const pupilsSortedWithFlags = pupilPresenter.getPupilsSortedWithIdentificationFlags(pupils)
  return res.render('hdf/review-pupil-details', {
    breadcrumbs: req.breadcrumbs(),
    pupils: pupilsSortedWithFlags
  })
}

const getEditReason = async (req, res, next) => {
  res.locals.pageTitle = 'Edit reason for not taking the check'
  req.breadcrumbs("Headteacher's declaration form", '/attendance/declaration-form')
  req.breadcrumbs('Review pupil details', '/attendance/review-pupil-details')
  req.breadcrumbs('Edit reason')
  if (!req.params.urlSlug) {
    return res.redirect('/attendance/review-pupil-details')
  }

  let pupil, attendanceCodes
  try {
    pupil = await headteacherDeclarationService.findPupilBySlugAndDfeNumber(req.params.urlSlug, req.user.School)
    attendanceCodes = await attendanceCodeService.getAttendanceCodes()
  } catch (error) {
    return next(error)
  }

  if (!pupil) {
    return next(new Error('Pupil not found in school'))
  }

  return res.render('hdf/attendance-edit-reason', {
    breadcrumbs: req.breadcrumbs(),
    pupil: pupil,
    attendanceCodes: attendanceCodes
  })
}

const postSubmitEditReason = async (req, res, next) => {
  const { urlSlug, attendanceCode } = req.body

  let pupil
  try {
    pupil = await headteacherDeclarationService.findPupilBySlugAndDfeNumber(urlSlug, req.user.School)
    await headteacherDeclarationService.updatePupilsAttendanceCode([pupil.id], attendanceCode, req.user.id)
  } catch (error) {
    return next(error)
  }

  req.flash('info', `Outcome updated for ${pupil.lastName}, ${pupil.foreName} `)
  req.flash('urlSlug', pupil.urlSlug)
  return res.redirect('/attendance/review-pupil-details')
}

const getConfirmSubmit = async (req, res, next) => {
  res.locals.pageTitle = 'Confirm and submit'
  req.breadcrumbs("Headteacher's declaration form", '/attendance/declaration-form')
  req.breadcrumbs('Review pupil details', '/attendance/review-pupil-details')
  req.breadcrumbs(res.locals.pageTitle)

  return res.render('hdf/confirm-and-submit', {
    formData: req.body,
    error: res.error || new ValidationError(),
    breadcrumbs: req.breadcrumbs()
  })
}

const postConfirmSubmit = async (req, res, next) => {
  let validationError = await hdfConfirmValidator.validate(req.body)
  if (validationError.hasError()) {
    res.error = validationError
    return getConfirmSubmit(req, res, next)
  }

  // Re-validate the hdf form data
  let hdfFormData = req.session.hdfFormData
  validationError = await hdfValidator.validate(hdfFormData)
  if (validationError.hasError()) {
    return next(new Error('Invalid HDF form data'))
  }

  // Re-check hdf eligibility
  let hdfEligibility
  try {
    hdfEligibility = await headteacherDeclarationService.getEligibilityForSchool(req.user.School)
  } catch (error) {
    return next(error)
  }
  if (!hdfEligibility) {
    return next(new Error('Not eligible to submit HDF'))
  }

  try {
    await headteacherDeclarationService.submitDeclaration({ ...hdfFormData, ...req.body }, req.user.School, req.user.id)
  } catch (error) {
    return next(error)
  }

  return res.redirect('/attendance/submitted')
}

const getDeclarationForm = async (req, res, next) => {
  res.locals.pageTitle = "Headteacher's declaration form"
  req.breadcrumbs(res.locals.pageTitle)

  try {
    const submitted = await headteacherDeclarationService.isHdfSubmittedForCurrentCheck(req.user.School)
    if (submitted) {
      return res.redirect('/attendance/submitted')
    }
  } catch (error) {
    return next(error)
  }

  let hdfEligibility
  try {
    hdfEligibility = await headteacherDeclarationService.getEligibilityForSchool(req.user.School)
  } catch (error) {
    return next(error)
  }

  return res.render('hdf/declaration-form', {
    hdfEligibility,
    formData: req.body,
    error: new ValidationError(),
    breadcrumbs: req.breadcrumbs()
  })
}

const postDeclarationForm = async (req, res, next) => {
  const { firstName, lastName, isHeadteacher, jobTitle } = req.body
  const form = { firstName, lastName, isHeadteacher, jobTitle }

  let hdfEligibility
  try {
    hdfEligibility = await headteacherDeclarationService.getEligibilityForSchool(req.user.School)
  } catch (error) {
    return next(error)
  }

  let validationError = await hdfValidator.validate(form)
  if (validationError.hasError()) {
    res.locals.pageTitle = "Headteacher's declaration form"
    req.breadcrumbs(res.locals.pageTitle)
    return res.render('hdf/declaration-form', {
      hdfEligibility,
      formData: form,
      error: validationError,
      breadcrumbs: req.breadcrumbs()
    })
  }

  req.session.hdfFormData = form

  return res.redirect('/attendance/review-pupil-details')
}

const getHDFSubmitted = async (req, res, next) => {
  res.locals.pageTitle = "Headteacher's declaration form"
  req.breadcrumbs(res.locals.pageTitle)
  try {
    const hdf = await headteacherDeclarationService.findLatestHdfForSchool(req.user.School)
    if (!hdf) {
      return res.redirect('/attendance/declaration-form')
    }
    const resultsDate = hdf.signedDate.add(1, 'weeks').isoWeekday(1)
    return res.render('hdf/submitted', {
      breadcrumbs: req.breadcrumbs(),
      hdf: hdf,
      dayAndDate: dateService.formatDayAndDate(hdf.signedDate),
      resultsDate: dateService.formatDayAndDate(resultsDate),
      canViewResults: moment().isAfter(resultsDate)
    })
  } catch (error) {
    return next(error)
  }
}

const getHDFSubmittedForm = async (req, res, next) => {
  res.locals.pageTitle = 'View submission'
  req.breadcrumbs("Headteacher's declaration form", '/attendance/declaration-form')
  req.breadcrumbs(res.locals.pageTitle)
  try {
    const hdf = await headteacherDeclarationService.findLatestHdfForSchool(req.user.School)
    if (!hdf) {
      return res.redirect('/attendance/declaration-form')
    }
    return res.render('hdf/submitted-form', {
      breadcrumbs: req.breadcrumbs(),
      hdf: hdf,
      signedDate: dateService.formatFullGdsDate(hdf.signedDate)
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  getResults,
  downloadResults,
  getReviewPupilDetails,
  getEditReason,
  postSubmitEditReason,
  getConfirmSubmit,
  postConfirmSubmit,
  getDeclarationForm,
  postDeclarationForm,
  getHDFSubmitted,
  getHDFSubmittedForm
}
