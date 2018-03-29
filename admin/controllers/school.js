'use strict'

const csv = require('fast-csv')
const moment = require('moment')

const dateService = require('../services/date.service')
const hdfValidator = require('../lib/validator/hdf-validator')
const headteacherDeclarationService = require('../services/headteacher-declaration.service')
const pupilService = require('../services/pupil.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const pupilIdentificationFlag = require('../services/pupil-identification-flag.service')
const pupilStatusService = require('../services/pupil.status.service')
const schoolDataService = require('../services/data-access/school.data.service')
const schoolService = require('../services/school.service')
const scoreService = require('../services/score.service')
const sortingAttributesService = require('../services/sorting-attributes.service')
const groupService = require('../services/group.service')
const ValidationError = require('../lib/validation-error')

/**
 * School landing page.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const getSchoolLandingPage = async (req, res, next) => {
  res.locals.pageTitle = 'School Homepage'
  let schoolName = ''

  try {
    schoolName = await schoolService.findOneByDfeNumber(req.user.School)
  } catch (error) {
    return next(error)
  }
  return res.render('school/school-home', {
    schoolName,
    breadcrumbs: [ { 'name': 'School Home' } ]
  })
}

// TODO: rename this pupil-register?  Create a pupil-register service?
const getPupils = async (req, res, next) => {
  res.locals.pageTitle = 'Pupil register'

  // Sorting
  const sortingOptions = [
    { 'key': 'name', 'value': 'asc' },
    { 'key': 'status', 'value': 'asc' },
    { 'key': 'group', 'value': 'asc' }
  ]
  const sortField = req.params.sortField === undefined ? 'name' : req.params.sortField
  const sortDirection = req.params.sortDirection === undefined ? 'asc' : req.params.sortDirection
  const { htmlSortDirection, arrowSortDirection } = sortingAttributesService.getAttributes(sortingOptions, sortField, sortDirection)

  let pupilsFormatted = []
  let groupsIndex = []

  try {
    groupsIndex = await groupService.getGroupsAsArray(req.user.schoolId)
    const pupils = await pupilDataService.sqlFindPupilsByDfeNumber(req.user.School, sortDirection)

    pupilsFormatted = await Promise.all(pupils.map(async (p, i) => {
      const { foreName, lastName, middleNames, dateOfBirth, urlSlug } = p
      const outcome = await pupilStatusService.getStatus(p)
      const group = groupsIndex[p.group_id] || '-'
      return {
        urlSlug,
        foreName,
        lastName,
        middleNames,
        dateOfBirth,
        group,
        outcome
      }
    })).catch((error) => next(error))
  } catch (error) {
    next(error)
  }

  pupilIdentificationFlag.addIdentificationFlags(pupilsFormatted)

  // If sorting by 'status', use custom method.
  if (sortField === 'status') {
    pupilsFormatted = pupilService.sortByStatus(pupilsFormatted, sortDirection)
  }

  // If sorting by 'group', use custom method.
  if (sortField === 'group') {
    pupilsFormatted = pupilService.sortByGroup(pupilsFormatted, sortDirection)
  }

  req.breadcrumbs(res.locals.pageTitle)
  let { hl } = req.query
  if (hl) {
    hl = JSON.parse(hl)
    hl = typeof hl === 'string' ? JSON.parse(hl) : hl
  }

  res.render('school/pupil-register', {
    highlight: hl && new Set(hl),
    pupils: pupilsFormatted,
    breadcrumbs: req.breadcrumbs(),
    htmlSortDirection,
    arrowSortDirection
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

/**
 * @deprecated potentially superfluous - attached to HDF
 */
const postSubmitAttendance = async (req, res, next) => {
  const attendees = req.body[ 'attendee' ]
  if (!attendees) {
    return res.redirect('/school/submit-attendance')
  }
  // const data = Object.values(req.body[ 'attendee' ] || [])
  // TODO consider removal as part of HDF refresh
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

module.exports = {
  getSchoolLandingPage,
  getPupils,
  getResults,
  downloadResults,
  getSubmitAttendance,
  postSubmitAttendance,
  getDeclarationForm,
  postDeclarationForm,
  getHDFSubmitted
}
