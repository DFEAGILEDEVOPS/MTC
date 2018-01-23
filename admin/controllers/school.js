'use strict'
const csv = require('fast-csv')
const moment = require('moment')
const mongoose = require('mongoose')

const attendanceCodeDataService = require('../services/data-access/attendance-code.data.service')
const attendanceService = require('../services/attendance.service')
const dateService = require('../services/date.service')
const hdfValidator = require('../lib/validator/hdf-validator')
const headteacherDeclarationService = require('../services/headteacher-declaration.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const pupilsNotTakingCheckDataService = require('../services/data-access/pupils-not-taking-check.data.service')
const pupilStatusService = require('../services/pupil.status.service')
const schoolDataService = require('../services/data-access/school.data.service')
const scoreService = require('../services/score.service')
const sortingAttributesService = require('../services/sorting-attributes.service')
const ValidationError = require('../lib/validation-error')
const { sortRecords } = require('../utils')

const getHome = async (req, res, next) => {
  res.locals.pageTitle = 'School Homepage'
  let schoolName = ''

  try {
    // TODO: extract this dataservice call to a service
    const school = await schoolDataService.sqlFindOneByDfeNumber(req.user.School)
    if (!school) {
      return next(new Error(`School not found: ${req.user.School}`))
    }
    schoolName = school.name
  } catch (error) {
    return next(error)
  }
  return res.render('school/school-home', {
    schoolName,
    breadcrumbs: [ { 'name': 'School Home' } ]
  })
}

const getPupils = async (req, res, next) => {
  res.locals.pageTitle = 'Pupil register'
  const { sortColumn, sortOrder } = req.params
  res.locals.sortColumn = sortColumn || 'lastName'
  const order = JSON.parse(sortOrder)
  res.locals.sortOrder = typeof order === 'boolean' ? !order : true
  res.locals.sortClass = order === false ? 'sort up' : 'sort'
  let pupilsFormatted
  try {
    const pupils = await pupilDataService.sqlFindPupilsByDfeNumber(req.user.School)
    pupilsFormatted = await Promise.all(pupils.map(async (p) => {
      const { foreName, lastName } = p
      const dob = dateService.formatShortGdsDate(p.dateOfBirth)
      const outcome = await pupilStatusService.getStatus(p)
      // TODO: Fetch pupil's group when it's implemented
      const group = 'N/A'
      return {
        urlSlug: p.urlSlug,
        foreName,
        lastName,
        dob,
        group,
        outcome
      }
    })).catch((error) => next(error))
  } catch (error) {
    next(error)
  }
  pupilsFormatted = sortRecords(pupilsFormatted, res.locals.sortColumn, order)
  pupilsFormatted.map((p, i) => {
    if (pupilsFormatted[ i + 1 ] === undefined) return
    if (pupilsFormatted[ i ].foreName === pupilsFormatted[ i + 1 ].foreName &&
      pupilsFormatted[ i ].lastName === pupilsFormatted[ i + 1 ].lastName) {
      pupilsFormatted[ i ].showDoB = true
      pupilsFormatted[ i + 1 ].showDoB = true
    }
  })
  req.breadcrumbs(res.locals.pageTitle)
  let { hl } = req.query
  if (hl) {
    hl = JSON.parse(hl)
    hl = typeof hl === 'string' ? JSON.parse(hl) : hl
  }
  res.render('school/pupil-register', {
    highlight: hl && new Set(hl),
    pupils: pupilsFormatted,
    breadcrumbs: req.breadcrumbs()
  })
}

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

const getSubmitAttendance = async (req, res, next) => {
  res.locals.pageTitle = 'Attendance register'
  req.breadcrumbs(res.locals.pageTitle)
  const pupils = await pupilDataService.sqlFindPupilsByDfeNumber(req.user.School)
  if (!pupils) {
    throw new Error('No pupils found')
  }

  // Redirect to confirmation of submission if hdf has been signed
  if (headteacherDeclarationService.isHdfSubmittedForCurrentCheck(req.user.School)) {
    return res.redirect('/school/declaration-form-submitted')
  }

  let pupilsFormatted = await Promise.all(pupils.map(async (p) => {
    const fullName = `${p.foreName} ${p.lastName}`
    const { id, hasAttended } = p
    const score = await scoreService.getScorePercentage(p.id)
    const hasScore = (score !== undefined)

    return {
      id,
      fullName,
      hasAttended,
      hasScore,
      score
    }
  })).catch((error) => next(error))
  pupilsFormatted = pupilsFormatted.filter((p) => p.percentage !== 'n/a')
  // Redirect to declaration form if at least one has been submitted for attendance
  if (pupilsFormatted.length > 0 && pupilsFormatted.some((p) => p.hasAttended)) {
    return res.redirect('/school/declaration-form')
  }
  return res.render('school/submit-attendance-register', {
    breadcrumbs: req.breadcrumbs(),
    pupils: pupilsFormatted
  })
}

const postSubmitAttendance = async (req, res, next) => {
  const attendees = req.body[ 'attendee' ]
  if (!attendees) {
    return res.redirect('/school/submit-attendance')
  }
  const data = Object.values(req.body[ 'attendee' ] || [])
  let ids = data.map(id => mongoose.Types.ObjectId(id))

  // TODO: extract this dataservice call to a service
  // Update attendance for selected pupils
  await pupilDataService.update(
    { _id: { $in: ids } },
    { $set: { hasAttended: true } },
    { multi: true }
  )

  // TODO: extract this dataservice call to a service
  // Expire all pins for school pupils
  await pupilDataService.update(
    { 'pupils.school': req.user.School },
    { $set: { pinExpired: true } },
    { multi: true }
  )

  return res.redirect('/school/declaration-form')
}

const getDeclarationForm = async (req, res) => {
  if (headteacherDeclarationService.isHdfSubmittedForCurrentCheck(req.user.School)) {
    return res.redirect('/school/declaration-form-submitted')
  }
  req.body[ 'fullName' ] = req.user && req.user[ 'UserName' ]
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
  const { jobTitle, fullName, declaration } = req.body

  let validationError = await hdfValidator.validate(req)
  if (validationError.hasError()) {
    res.locals.pageTitle = 'Headteacher\'s declaration form'
    req.breadcrumbs(res.locals.pageTitle)
    return res.render('school/declaration-form', {
      formData: req.body,
      error: validationError,
      breadcrumbs: req.breadcrumbs()
    })
  }

  try {
    const form = {
      jobTitle,
      fullName,
      declaration
    }
    await headteacherDeclarationService.declare(form, req.user.School, req.user.id)
  } catch (error) {
    return next(error)
  }

  return res.redirect('/school/declaration-form-submitted')
}

const getHDFSubmitted = async (req, res, next) => {
  res.locals.pageTitle = 'Headteacher\'s declaration form submitted'
  req.breadcrumbs(res.locals.pageTitle)
  try {
    const hdf = await headteacherDeclarationService.findLatestHdfForSchool(req.user.School)
    return res.render('school/declaration-form-submitted', {
      breadcrumbs: req.breadcrumbs(),
      signedDate: dateService.formatFullGdsDate(hdf.signedDate)
    })
  } catch (error) {
    return next(error)
  }
}

/**
 * Pupils not taking the check: initial page.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
const getPupilNotTakingCheck = async (req, res, next) => {
  res.locals.pageTitle = 'Pupils not taking the check'
  req.breadcrumbs(res.locals.pageTitle)

  try {
    // Get pupils for active school
    const pupils = await pupilsNotTakingCheckDataService.sqlFindPupilsWithReasons(req.user.School)
    return res.render('school/pupils-not-taking-check', {
      breadcrumbs: req.breadcrumbs(),
      pupilsList: pupils,
      highlight: [],
      messages: req.flash('info')
    })
  } catch (error) {
    return next(error)
  }
}

/**
 * Pupils not taking the check: pupil selection to add a new reason or change a reason
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
const getSelectPupilNotTakingCheck = async (req, res, next) => {
  res.locals.pageTitle = 'Add reason'
  req.breadcrumbs('Pupils not taking the check', '/school/pupils-not-taking-check')
  req.breadcrumbs(res.locals.pageTitle)

  let attendanceCodes
  let pupils

  // Sorting
  const sortingOptions = [
    { 'key': 'name', 'value': 'asc' },
    { 'key': 'reason', 'value': 'asc' }
  ]
  const sortField = req.params.sortField === undefined ? 'name' : req.params.sortField
  const sortDirection = req.params.sortDirection === undefined ? 'asc' : req.params.sortDirection
  const { htmlSortDirection, arrowSortDirection } = sortingAttributesService.getAttributes(sortingOptions, sortField, sortDirection)

  try {
    attendanceCodes = await attendanceCodeDataService.sqlFindAttendanceCodes()
    pupils = await pupilDataService.sqlFindSortedPupilsWithAttendanceReasons(req.user.School, sortField, sortDirection)
  } catch (error) {
    return next(error)
  }

  return res.render('school/select-pupils-not-taking-check', {
    breadcrumbs: req.breadcrumbs(),
    sortField,
    sortDirection,
    attendanceCodes,
    pupilsList: pupils,
    htmlSortDirection,
    arrowSortDirection,
    highlight: []
  })
}

/**
 * Pupils not taking the check: save reason.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
const savePupilNotTakingCheck = async (req, res, next) => {
  res.locals.pageTitle = 'Save pupils not taking the check'
  req.breadcrumbs(res.locals.pageTitle)

  if (req.body.attendanceCode === undefined || req.body.pupil === undefined) {
    return res.redirect('/school/pupils-not-taking-check/select-pupils')
  }

  // The req.body.pupil data is posted in 3 forms:
  // 1: string: 'abc-def' (single selection)
  // 2: array of strings: ['abc-def', 'foo-bar'] (multiple selection)
  // 3: object with properties/values: { 0: 'abc-def, 1: 'foo-bar' } (using checkbox "Select all")
  let postedPupilSlugs
  if (typeof req.body.pupil === 'object') {
    if (Array.isArray(req.body.pupil)) {
      postedPupilSlugs = req.body.pupil
    } else {
      postedPupilSlugs = Object.values(req.body.pupil)
    }
  } else if (typeof req.body.pupil === 'string') {
    postedPupilSlugs = [ req.body.pupil ]
  }
  try {
    // Update the pupils with the attendanceCode
    await attendanceService.updatePupilAttendanceBySlug(
      postedPupilSlugs,
      req.body.attendanceCode,
      req.user.id)

    req.flash('info', `${postedPupilSlugs.length} pupil reasons updated`)

    // Send the information required for highlighting
    const highlight = JSON.stringify(postedPupilSlugs)
    return res.redirect(`/school/pupils-not-taking-check/view?hl=${highlight}`)
  } catch (error) {
    return next(error)
  }
}

/**
 * Remove an attendance code for a pupil
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
const removePupilNotTakingCheck = async (req, res, next) => {
  if (!req.params.pupilId || !req.user.School) {
    return res.redirect('/school/pupils-not-taking-check/select-pupils')
  }
  const pupilSlug = req.params.pupilId
  try {
    await attendanceService.unsetAttendanceCode(pupilSlug, req.user.School)

    // Update the flash message for the user on the next screen
    const pupil = await pupilDataService.sqlFindOneBySlugAndSchool(pupilSlug, req.user.School)
    req.flash('info', `Reason removed for pupil ${pupil.lastName}, ${pupil.foreName}`)

    // Send the information required for highlighting
    const highlight = JSON.stringify(pupilSlug)
    return res.redirect(`/school/pupils-not-taking-check/view?hl=${highlight}`)
  } catch (error) {
    next(error)
  }
}

/**
 * View the list of pupils that are not taking the check
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
const viewPupilsNotTakingTheCheck = async (req, res, next) => {
  res.locals.pageTitle = 'View pupils not taking the check'
  req.breadcrumbs(res.locals.pageTitle)
  const highlight = req.query.hl || []
  try {
    const pupilsList = await pupilsNotTakingCheckDataService.sqlFindPupilsWithReasons(req.user.School)
    return res.render('school/pupils-not-taking-check', {
      breadcrumbs: req.breadcrumbs(),
      pupilsList,
      messages: res.locals.messages,
      highlight
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  getHome,
  getPupils,
  getResults,
  downloadResults,
  getSubmitAttendance,
  postSubmitAttendance,
  getDeclarationForm,
  postDeclarationForm,
  getHDFSubmitted,
  getPupilNotTakingCheck,
  getSelectPupilNotTakingCheck,
  savePupilNotTakingCheck,
  removePupilNotTakingCheck,
  viewPupilsNotTakingTheCheck
}
