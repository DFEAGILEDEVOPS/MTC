'use strict'

const pupilsNotTakingCheckService = require('../services/pupils-not-taking-check.service')
const attendanceCodeService = require('../services/attendance.service')
const attendanceCodeDataService = require('../services/data-access/attendance-code.data.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const sortingAttributesService = require('../services/sorting-attributes.service')
const groupService = require('../services/group.service')

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
    const pupils = await pupilsNotTakingCheckService.pupilsWithReasons(req.user.School)
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
  res.locals.pageTitle = 'Select pupil and reason'
  req.breadcrumbs('Pupils not taking the check', '/school/pupils-not-taking-check')
  req.breadcrumbs(res.locals.pageTitle)

  let attendanceCodes
  let pupils
  let groups = []
  let groupIds = req.params.groupIds || ''

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
    pupils = await pupilsNotTakingCheckService.pupils(req.user.School, sortField, sortDirection)
  } catch (error) {
    return next(error)
  }

  try {
    groups = await groupService.getGroups(req.user.schoolId)
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
    highlight: [],
    groups,
    groupIds
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
    await attendanceCodeService.updatePupilAttendanceBySlug(
      postedPupilSlugs,
      req.body.attendanceCode,
      req.user.id)

    const reasonText = postedPupilSlugs.length > 1 ? 'reasons' : 'reason'
    req.flash('info', `${postedPupilSlugs.length} ${reasonText} updated`)

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
    await attendanceCodeService.unsetAttendanceCode(pupilSlug, req.user.School)
    const pupil = await pupilDataService.sqlFindOneBySlugAndSchool(pupilSlug, req.user.School)
    req.flash('info', `Reason removed for ${pupil.lastName}, ${pupil.foreName}`)
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
    const pupilsList = await pupilsNotTakingCheckService.pupilsWithReasons(req.user.School)
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
  getPupilNotTakingCheck,
  getSelectPupilNotTakingCheck,
  savePupilNotTakingCheck,
  removePupilNotTakingCheck,
  viewPupilsNotTakingTheCheck
}
