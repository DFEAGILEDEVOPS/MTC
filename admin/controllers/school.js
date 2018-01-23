'use strict'
const moment = require('moment')
const csv = require('fast-csv')
const mongoose = require('mongoose')

const ValidationError = require('../lib/validation-error')
const hdfValidator = require('../lib/validator/hdf-validator')
const pupilService = require('../services/pupil.service')
const pupilsNotTackingCheckService = require('../services/pupils-not-taking-check.service')
const pupilsNotTackingCheckDataService = require('../services/data-access/pupils-not-taking-check.data.service')
const dateService = require('../services/date.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const schoolDataService = require('../services/data-access/school.data.service')
const { sortRecords } = require('../utils')
const sortingAttributesService = require('../services/sorting-attributes.service')
const scoreService = require('../services/score.service')
const pupilStatusService = require('../services/pupil.status.service')

const getHome = async (req, res, next) => {
  res.locals.pageTitle = 'School Homepage'
  let schoolName = ''

  try {
    // TODO: extract this dataservice call to a service
    const school = await schoolDataService.findOne({ '_id': req.user.School })
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
    const { pupils } = await pupilDataService.getPupils(req.user.School)
    pupilsFormatted = await Promise.all(pupils.map(async (p) => {
      const { foreName, lastName, _id } = p
      const dob = dateService.formatShortGdsDate(p.dob)
      const outcome = await pupilStatusService.getStatus(p)
      // TODO: Fetch pupil's group when it's implemented
      const group = 'N/A'
      return {
        _id,
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
  const { pupils, schoolData } = await pupilDataService.getPupils(req.user.School)
  let pupilsFormatted = await Promise.all(pupils.map(async (p) => {
    const fullName = `${p.foreName} ${p.lastName}`
    const score = await scoreService.getScorePercentage(p._id)
    const hasScore = (score !== undefined)
    return {
      fullName,
      hasScore,
      score
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
  const { schoolData, pupils } = await pupilDataService.getPupils(req.user.School)
  // Format the pupils
  let pupilsFormatted = await Promise.all(pupils.map(async (p) => {
    const fullName = `${p.foreName} ${p.lastName}`
    const dob = moment(p.dob).format('DD/MM/YYYY')
    const answersSet = await pupilService.fetchAnswers(p._id)
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
  const { pupils, schoolData } = await pupilDataService.getPupils(req.user.School)
  // Redirect to confirmation of submission if hdf has been signed
  if (schoolData.hdf && schoolData.hdf.signedDate) {
    return res.redirect('/school/declaration-form-submitted')
  }
  let pupilsFormatted = await Promise.all(pupils.map(async (p) => {
    const fullName = `${p.foreName} ${p.lastName}`
    const { _id: id, hasAttended } = p
    const score = await scoreService.getScorePercentage(p._id)
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
  const { schoolData } = await pupilDataService.getPupils(req.user.School)
  if (schoolData.hdf && schoolData.hdf.signedDate) {
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
  // TODO: extract this dataservice call to a service
  const school = await schoolDataService.findOne({ '_id': req.user.School })
  school.hdf = {
    signedDate: Date.now(),
    declaration,
    jobTitle,
    fullName
  }

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
    // TODO: extract this dataservice call to a service
    await schoolDataService.update(school)
  } catch (error) {
    return next(error)
  }
  return res.redirect('/school/declaration-form-submitted')
}

const getHDFSubmitted = async (req, res, next) => {
  res.locals.pageTitle = 'Headteacher\'s declaration form submitted'
  req.breadcrumbs(res.locals.pageTitle)
  try {
    // TODO: extract this dataservice call to a service
    const school = await schoolDataService.findOne({ '_id': req.user.School })
    const { hdf: { signedDate } } = school
    return res.render('school/declaration-form-submitted', {
      breadcrumbs: req.breadcrumbs(),
      signedDate: signedDate && moment(signedDate).format('Do MMMM YYYY')
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

  let pupilsList
  let attendanceCodes
  let pupils

  // Flash message after removing a reason
  if (req.params.removed) {
    let flashMessage = 'Reason removed'
    const pupil = await pupilService.fetchOnePupil(req.params.removed, req.user.School)
    if (pupil) {
      flashMessage = `Reason removed for ${pupil.lastName}, ${pupil.foreName}`
    }
    req.flash('info', flashMessage)
  }

  // Get attendance code index
  try {
    attendanceCodes = await pupilsNotTackingCheckDataService.getAttendanceCodes()
  } catch (error) {
    return next(error)
  }

  // Get pupils for active school
  try {
    pupils = await pupilsNotTackingCheckDataService.fetchPupilsWithReasons(req.user.School)
  } catch (error) {
    return next(error)
  }

  if (attendanceCodes && pupils) {
    pupilsList = await pupilsNotTackingCheckService.formatPupilsWithReasons(attendanceCodes, pupils)
  }

  return res.render('school/pupils-not-taking-check', {
    breadcrumbs: req.breadcrumbs(),
    pupilsList,
    messages: req.flash('info')
  })
}

/**
 * Pupils not taking the check: render and sorting.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
const getSelectPupilNotTakingCheck = async (req, res, next) => {
  res.locals.pageTitle = 'Select pupil and reason'
  req.breadcrumbs('Pupils not taking the check', '/school/pupils-not-taking-check')
  req.breadcrumbs(res.locals.pageTitle)

  let attendanceCodes
  let pupils
  let pupilsList

  // Sorting
  const sortingOptions = [
    { 'key': 'name', 'value': 'asc' },
    { 'key': 'reason', 'value': 'asc' }
  ]
  const sortField = req.params.sortField === undefined ? 'name' : req.params.sortField
  const sortDirection = req.params.sortDirection === undefined ? 'asc' : req.params.sortDirection
  const { htmlSortDirection, arrowSortDirection } = sortingAttributesService.getAttributes(sortingOptions, sortField, sortDirection)

  // Get attendance code index
  try {
    attendanceCodes = await pupilsNotTackingCheckDataService.getAttendanceCodes()
  } catch (error) {
    return next(error)
  }

  // Get pupils for active school
  try {
    pupils = await pupilDataService.getSortedPupils(req.user.School, 'lastName', sortDirection)
  } catch (error) {
    return next(error)
  }

  if (attendanceCodes && pupils) {
    pupilsList = await pupilsNotTackingCheckService.formatPupilsWithReasons(attendanceCodes, pupils)
  }

  // Sorting by 'reason' needs to be done using .sort
  if (sortField === 'reason') {
    pupilsList = pupilsNotTackingCheckService.sortPupilsByReason(pupilsList, sortDirection)
  }

  return res.render('school/select-pupils-not-taking-check', {
    breadcrumbs: req.breadcrumbs(),
    sortField,
    sortDirection,
    attendanceCodes,
    pupilsList,
    htmlSortDirection,
    arrowSortDirection
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

  const todayDate = moment(moment.now()).format()
  const postedPupils = req.body.pupil
  const pupilsData = await pupilService.fetchMultiplePupils(Object.values(postedPupils))

  let pupilsList
  let attendanceCodes
  let pupils

  for (let index = 0; index < pupilsData.length; index++) {
    let pupil = pupilsData[index]
    pupil.attendanceCode = {
      _id: req.body.attendanceCode,
      dateRecorded: new Date(todayDate),
      byUserName: req.user.UserName,
      byUserEmail: req.user.EmailAddress
    }
  }

  // @TODO: Auditing (to be discussed)
  try {
    for (let index = 0; index < pupilsData.length; index++) {
      const pupil = pupilsData[index]
      await pupilDataService.update({_id: pupil._id}, pupil)
    }
    const reasonText = pupilsData.length > 1 ? 'reasons' : 'reason'
    req.flash('info', `${pupilsData.length} ${reasonText} updated`)
  } catch (error) {
    return next(error)
  }

  // Get attendance code index
  try {
    attendanceCodes = await pupilsNotTackingCheckDataService.getAttendanceCodes()
  } catch (error) {
    return next(error)
  }

  // Get pupils for active school
  try {
    pupils = await pupilsNotTackingCheckDataService.fetchPupilsWithReasons(req.user.School)
  } catch (error) {
    return next(error)
  }

  if (attendanceCodes && pupils) {
    pupilsList = await pupilsNotTackingCheckService.formatPupilsWithReasons(attendanceCodes, pupils, Object.values(postedPupils))
  }

  return res.render('school/pupils-not-taking-check', {
    breadcrumbs: req.breadcrumbs(),
    pupilsList,
    messages: req.flash('info')
  })
}

/**
 * Removing reason for pupil.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
const removePupilNotTakingCheck = async (req, res, next) => {
  if (!req.params.pupilId || !req.user.School) {
    return res.redirect('/school/pupils-not-taking-check/select-pupils')
  }
  const pupilId = req.params.pupilId
  try {
    let pupil = await pupilService.fetchOnePupil(pupilId, req.user.School)
    if (!pupil) {
      return next(new Error(`Pupil with id ${pupilId} and school ${req.user.School} not found`))
    }
    // TODO: extract this dataservice call to a service
    await pupilDataService.unsetAttendanceCode(pupil._id)
  } catch (error) {
    next(error)
  }
  return res.redirect(`/school/pupils-not-taking-check/${pupilId}`)
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
  removePupilNotTakingCheck
}
