'use strict'

const attendanceCodeService = require('../services/attendance.service')
const checkWindowV2Service = require('../services/check-window-v2.service')
const groupService = require('../services/group.service')
const pupilsNotTakingCheckService = require('../services/pupils-not-taking-check.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const pupilStatusService = require('../services/pupil.status.service')
const schoolHomeFeatureEligibilityPresenter = require('../helpers/school-home-feature-eligibility-presenter')
const headteacherDeclarationService = require('../services/headteacher-declaration.service')
const businessAvailabilityService = require('../services/business-availability.service')

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
  let checkWindowData
  let pupils
  let pinGenerationEligibilityData
  let hdfSubmitted
  try {
    // Get pupils for active school
    pupils = await pupilsNotTakingCheckService.getPupilsWithReasons(req.user.School)
    checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData, req.user.timezone)
    hdfSubmitted = await headteacherDeclarationService.isHdfSubmittedForCurrentCheck(req.user.School, checkWindowData && checkWindowData.id)
  } catch (error) {
    return next(error)
  }
  return res.render('pupils-not-taking-the-check/select-pupils', {
    breadcrumbs: req.breadcrumbs(),
    pupilsList: pupils,
    highlight: [],
    messages: req.flash('info'),
    pinGenerationEligibilityData,
    hdfSubmitted
  })
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
  req.breadcrumbs('Pupils not taking the check', '/pupils-not-taking-the-check')
  req.breadcrumbs(res.locals.pageTitle)

  let attendanceCodes
  let pupilsList
  let groups = []
  let groupIds = req.params.groupIds || ''

  try {
    const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    const availabilityData = await businessAvailabilityService.getAvailabilityData(req.user.School, checkWindowData, req.user.timezone)
    if (availabilityData.hdfSubmitted) {
      return res.render('availability/section-unavailable', {
        title: res.locals.pageTitle,
        breadcrumbs: req.breadcrumbs()
      })
    }
    attendanceCodes = await attendanceCodeService.getAttendanceCodes()
    pupilsList = await pupilsNotTakingCheckService.getPupilsWithoutReasons(req.user.schoolId)
  } catch (error) {
    return next(error)
  }

  try {
    groups = await groupService.getGroupsWithPresentPupils(req.user.schoolId)
  } catch (error) {
    return next(error)
  }

  return res.render('pupils-not-taking-the-check/pupils-list', {
    breadcrumbs: req.breadcrumbs(),
    attendanceCodes,
    pupilsList,
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
    return res.redirect('/pupils-not-taking-the-check/select-pupils')
  }

  const postedPupilSlugs = pupilsNotTakingCheckService.getPupilSlugs(req.body.pupil)
  try {
    // Update the pupils with the attendanceCode
    await attendanceCodeService.updatePupilAttendanceBySlug(
      postedPupilSlugs,
      req.body.attendanceCode,
      req.user.id,
      req.user.schoolId)

    const reasonText = postedPupilSlugs.length > 1 ? 'reasons' : 'reason'
    req.flash('info', `${postedPupilSlugs.length} ${reasonText} updated`)

    // Ask for these pupils to have their status updated
    await pupilStatusService.recalculateStatusByPupilSlugs(postedPupilSlugs, req.user.schoolId)

    // Send the information required for highlighting
    const highlight = JSON.stringify(postedPupilSlugs)
    return res.redirect(`/pupils-not-taking-the-check/view?hl=${highlight}`)
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
    return res.redirect('/pupils-not-taking-the-check/select-pupils')
  }
  const pupilSlug = req.params.pupilId
  try {
    await attendanceCodeService.unsetAttendanceCode(pupilSlug, req.user.School)
    const pupil = await pupilDataService.sqlFindOneBySlugAndSchool(pupilSlug, req.user.School)
    req.flash('info', `Reason removed for ${pupil.lastName}, ${pupil.foreName}`)

    // Ask for this pupil to have their status updated
    await pupilStatusService.recalculateStatusByPupilSlugs([pupilSlug], req.user.schoolId)

    const highlight = JSON.stringify(pupilSlug)
    return res.redirect(`/pupils-not-taking-the-check/view?hl=${highlight}`)
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
  let checkWindowData
  let pinGenerationEligibilityData
  let hdfSubmitted
  try {
    const pupilsList = await pupilsNotTakingCheckService.getPupilsWithReasons(req.user.School)
    checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData, req.user.timezone)
    hdfSubmitted = await headteacherDeclarationService.isHdfSubmittedForCurrentCheck(req.user.School, checkWindowData && checkWindowData.id)
    return res.render('pupils-not-taking-the-check/select-pupils', {
      breadcrumbs: req.breadcrumbs(),
      pupilsList,
      messages: res.locals.messages,
      highlight,
      pinGenerationEligibilityData,
      hdfSubmitted
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
