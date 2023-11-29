'use strict'

const csv = require('fast-csv')
const moment = require('moment')

const dateService = require('../services/date.service')
const hdfValidator = require('../lib/validator/hdf-validator')
const hdfConfirmValidator = require('../lib/validator/hdf-confirm-validator')
const headteacherDeclarationService = require('../services/headteacher-declaration.service')
const pupilService = require('../services/pupil.service')
const pupilPresenter = require('../helpers/pupil-presenter')
const hdfPresenter = require('../helpers/hdf-presenter')
const schoolService = require('../services/school.service')
const checkWindowV2Service = require('../services/check-window-v2.service')
const scoreService = require('../services/score.service')
const businessAvailabilityService = require('../services/business-availability.service')
const ValidationError = require('../lib/validation-error')
const attendanceCodeService = require('../services/attendance.service')

const controller = {}

controller.getResults = async function getResults (req, res, next) {
  res.locals.pageTitle = 'Results'
  const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
  const pupils = await pupilService.findPupilsBySchoolId(req.user.schoolId)
  const school = await schoolService.findOneById(req.user.schoolId)
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

  const hdfSubmitted = await headteacherDeclarationService.isHdfSubmittedForCurrentCheck(req.user.School, checkWindowData && checkWindowData.id)

  if (hdfSubmitted &&
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
controller.downloadResults = async function downloadResults (req, res, next) {
  // TODO: refactor to make it smaller
  // @ts-ignore needs refactoring to csv.format() - https://c2fo.io/fast-csv/docs/migration-guides/v2.x-to-v3.x/
  const csvStream = csv.createWriteStream()
  const pupils = await pupilService.findPupilsBySchoolId(req.user.schoolId)
  const schoolData = await schoolService.findOneById(pupils[0].school_id)
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

controller.getReviewPupilDetails = async function getReviewPupilDetails (req, res, next) {
  res.locals.pageTitle = 'Review pupil details'
  req.breadcrumbs("Headteacher's declaration form", '/attendance/declaration-form')
  req.breadcrumbs(res.locals.pageTitle)
  try {
    const pupils = await headteacherDeclarationService.findPupilsForSchool(req.user.schoolId)
    if (!pupils) {
      return next('No pupils found')
    }
    const pupilsSortedWithFlags = pupilPresenter.getPupilsSortedWithIdentificationFlags(pupils)
    return res.render('hdf/review-pupil-details', {
      breadcrumbs: req.breadcrumbs(),
      pupils: pupilsSortedWithFlags
    })
  } catch (error) {
    return next(error)
  }
}

controller.getEditReason = async function getEditReason (req, res, next) {
  res.locals.pageTitle = 'Edit reason for not taking the check'
  req.breadcrumbs("Headteacher's declaration form", '/attendance/declaration-form')
  req.breadcrumbs('Review pupil details', '/attendance/review-pupil-details')
  req.breadcrumbs('Edit reason')
  if (!req.params.urlSlug) {
    return res.redirect('/attendance/review-pupil-details')
  }

  let pupil, attendanceCodes
  try {
    pupil = await headteacherDeclarationService.findPupilBySlugAndSchoolId(req.params.urlSlug, req.user.schoolId)
    attendanceCodes = await attendanceCodeService.getAttendanceCodes()
  } catch (error) {
    return next(error)
  }

  if (!pupil) {
    return next(new Error('Pupil not found in school'))
  }

  return res.render('hdf/attendance-edit-reason', {
    breadcrumbs: req.breadcrumbs(),
    pupil,
    attendanceCodes
  })
}

controller.postSubmitEditReason = async function postSubmitEditReason (req, res, next) {
  const { urlSlug, attendanceCode } = req.body
  try {
    const pupil = await headteacherDeclarationService.findPupilBySlugAndSchoolId(urlSlug, req.user.schoolId)
    await headteacherDeclarationService.updatePupilsAttendanceCode([pupil.pupilId], attendanceCode, req.user.id, req.user.schoolId)
    req.flash('info', `Outcome updated for ${pupil.lastName}, ${pupil.foreName} `)
    req.flash('urlSlug', pupil.urlSlug)
    return res.redirect('/attendance/review-pupil-details')
  } catch (error) {
    return next(error)
  }
}

controller.getConfirmSubmit = async function getConfirmSubmit (req, res, next) {
  res.locals.pageTitle = 'Confirm and submit'
  req.breadcrumbs("Headteacher's declaration form", '/attendance/declaration-form')
  req.breadcrumbs('Review pupil details', '/attendance/review-pupil-details')
  req.breadcrumbs(res.locals.pageTitle)

  try {
    const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    const availabilityData = await businessAvailabilityService.getAvailabilityData(req.user.schoolId, checkWindowData, req.user.timezone)
    const hdfEligibility = await headteacherDeclarationService.getEligibilityForSchool(req.user.schoolId, checkWindowData.checkEndDate, req.user.timezone)
    if (!hdfEligibility) {
      return res.render('hdf/declaration-form', {
        hdfEligibility,
        formData: req.body,
        checkEndDate: dateService.formatDayAndDate(checkWindowData.checkEndDate),
        error: new ValidationError(),
        breadcrumbs: req.breadcrumbs()
      })
    }
    if (!availabilityData.hdfAvailable) {
      return res.render('availability/section-unavailable', {
        title: res.locals.pageTitle,
        breadcrumbs: req.breadcrumbs()
      })
    }
    return res.render('hdf/confirm-and-submit', {
      formData: req.body,
      error: res.error || new ValidationError(),
      breadcrumbs: req.breadcrumbs()
    })
  } catch (error) {
    return next(error)
  }
}

controller.postConfirmSubmit = async function postConfirmSubmit (req, res, next) {
  let validationError = await hdfConfirmValidator.validate(req.body)
  if (validationError.hasError()) {
    res.error = validationError
    return controller.getConfirmSubmit(req, res, next)
  }

  // Re-validate the hdf form data
  const hdfFormData = req.session.hdfFormData
  validationError = await hdfValidator.validate(hdfFormData)
  if (validationError.hasError()) {
    return next(new Error('Invalid HDF form data'))
  }

  try {
    const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    await headteacherDeclarationService
      .submitDeclaration({ ...hdfFormData, ...req.body }, req.user.id, req.user.schoolId, checkWindowData.checkEndDate, req.user.timezone)
  } catch (error) {
    return next(error)
  }

  return res.redirect('/attendance/submitted')
}

controller.getDeclarationForm = async function getDeclarationForm (req, res, next) {
  res.locals.pageTitle = "Headteacher's declaration form"
  req.breadcrumbs(res.locals.pageTitle)
  let checkWindowData
  let hdfEligibility

  try {
    checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    const availabilityData = await businessAvailabilityService.getAvailabilityData(req.user.schoolId, checkWindowData, req.user.timezone)
    const hdfSubmitted = await headteacherDeclarationService.isHdfSubmittedForCurrentCheck(req.user.schoolId, checkWindowData && checkWindowData.id)
    if (!availabilityData.hdfAvailable) {
      return res.render('availability/section-unavailable', {
        title: res.locals.pageTitle,
        breadcrumbs: req.breadcrumbs()
      })
    }
    if (hdfSubmitted) {
      return res.redirect('/attendance/submitted')
    }
    hdfEligibility = await headteacherDeclarationService.getEligibilityForSchool(req.user.schoolId, checkWindowData.checkEndDate, req.user.timezone)
  } catch (error) {
    return next(error)
  }

  return res.render('hdf/declaration-form', {
    hdfEligibility,
    formData: req.body,
    checkEndDate: dateService.formatDayAndDate(checkWindowData.checkEndDate),
    error: new ValidationError(),
    breadcrumbs: req.breadcrumbs()
  })
}

controller.postDeclarationForm = async function postDeclarationForm (req, res, next) {
  const { firstName, lastName, isHeadteacher, jobTitle } = req.body
  const form = { firstName, lastName, isHeadteacher, jobTitle }
  const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()

  let hdfEligibility
  try {
    hdfEligibility = await headteacherDeclarationService.getEligibilityForSchool(req.user.schoolId, checkWindowData.checkEndDate, req.user.timezone)
  } catch (error) {
    return next(error)
  }

  const validationError = await hdfValidator.validate(form)
  if (validationError.hasError()) {
    res.locals.pageTitle = "Headteacher's declaration form"
    req.breadcrumbs(res.locals.pageTitle)
    return res.render('hdf/declaration-form', {
      hdfEligibility,
      formData: form,
      checkEndDate: dateService.formatDayAndDate(checkWindowData.checkEndDate),
      error: validationError,
      breadcrumbs: req.breadcrumbs()
    })
  }

  req.session.hdfFormData = form

  return res.redirect('/attendance/review-pupil-details')
}

controller.getHDFSubmitted = async function getHDFSubmitted (req, res, next) {
  res.locals.pageTitle = "Headteacher's declaration form"
  req.breadcrumbs(res.locals.pageTitle)
  try {
    const hdf = await headteacherDeclarationService.findLatestHdfForSchool(req.user.School)
    if (!hdf) {
      return res.redirect('/attendance/declaration-form')
    }
    const resultsDate = hdfPresenter.getResultsDate(hdf)
    return res.render('hdf/submitted', {
      breadcrumbs: req.breadcrumbs(),
      signedDayAndDate: dateService.formatShortGdsDate(hdf.signedDate),
      hdf,
      canViewResults: hdfPresenter.getCanViewResults(resultsDate)
    })
  } catch (error) {
    return next(error)
  }
}

controller.getHDFSubmittedForm = async function getHDFSubmittedForm (req, res, next) {
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
      hdf,
      signedDate: dateService.formatFullGdsDate(hdf.signedDate)
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = controller
