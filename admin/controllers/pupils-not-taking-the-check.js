'use strict'

const attendanceCodeService = require('../services/attendance.service')
const checkWindowV2Service = require('../services/check-window-v2.service')
const groupService = require('../services/group.service')
const pupilsNotTakingCheckService = require('../services/pupils-not-taking-check.service')
const pupilService = require('../services/pupil.service')
const schoolHomeFeatureEligibilityPresenter = require('../helpers/school-home-feature-eligibility-presenter')
const headteacherDeclarationService = require('../services/headteacher-declaration.service')
const businessAvailabilityService = require('../services/business-availability.service')
const checkWindowPhaseConsts = require('../lib/consts/check-window-phase')

/**
 * Pupils not taking the check: lists any pupils with attendance set.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
const getPupilNotTakingCheck = async function getPupilNotTakingCheck (req, res, next) {
  res.locals.pageTitle = 'Give a reason why a pupil is not taking the check'
  req.breadcrumbs(res.locals.pageTitle)
  let checkWindowData
  let pupils
  let pinGenerationEligibilityData
  let hdfSubmitted
  try {
    // Get pupils for active school
    pupils = await pupilsNotTakingCheckService.getPupilsWithReasons(req.user.schoolId)
    checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData, req.user.timezone)
    hdfSubmitted = await headteacherDeclarationService.isHdfSubmittedForCurrentCheck(req.user.schoolId, checkWindowData && checkWindowData.id)
  } catch (error) {
    return next(error)
  }

  // @ts-ignore - defined in server.js
  const isReadOnly = global.checkWindowPhase === checkWindowPhaseConsts.readOnlyAdmin
  const showSelectPupilButton = isReadOnly ? false : !hdfSubmitted

  return res.render('pupils-not-taking-the-check/select-pupils', {
    breadcrumbs: req.breadcrumbs(),
    pupilsList: pupils,
    highlight: [],
    messages: req.flash('info'),
    pinGenerationEligibilityData,
    hdfSubmitted,
    showSelectPupilButton,
    isReadOnly
  })
}

/**
 * Pupils not taking the check: pupil selection to add a new reason or remove a reason
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
const getSelectPupilNotTakingCheck = async function getSelectPupilNotTakingCheck (req, res, next) {
  res.locals.pageTitle = 'Select pupil and reason'
  req.breadcrumbs('Give a reason why a pupil is not taking the check', '/pupils-not-taking-the-check')
  req.breadcrumbs(res.locals.pageTitle)

  let attendanceCodes
  let pupilsList
  let groups = []
  const groupIds = req.params.groupIds || ''

  try {
    const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    const availabilityData = await businessAvailabilityService.getAvailabilityData(req.user.schoolId, checkWindowData, req.user.timezone)
    if (availabilityData.hdfSubmitted) {
      return res.render('availability/section-unavailable', {
        title: res.locals.pageTitle,
        breadcrumbs: req.breadcrumbs()
      })
    }
    attendanceCodes = await attendanceCodeService.getAttendanceCodes()
    if (availabilityData.inAdminEndPeriod) {
      // When we are in the post-check final admin period, pupils who have not been marked as complete are allowed
      // to be marked as not attending, as there is no other option for them, and this allows the HDF to be signed.
      pupilsList = await pupilsNotTakingCheckService.getPupilsWithoutReasonsInAdminPeriod(req.user.schoolId)
    } else {
      // For familiarisation and live check phases, we have tight rules on which pupils can be selected for not
      // attending
      pupilsList = await pupilsNotTakingCheckService.getPupilsWithoutReasons(req.user.schoolId)
    }
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
    attendanceCodesPresentationData: attendanceCodes,
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
const savePupilNotTakingCheck = async function savePupilNotTakingCheck (req, res, next) {
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
const removePupilNotTakingCheck = async function removePupilNotTakingCheck (req, res, next) {
  if (!req.params.pupilId || !req.user.School) {
    return res.redirect('/pupils-not-taking-the-check/select-pupils')
  }
  const pupilSlug = req.params.pupilId
  try {
    await attendanceCodeService.unsetAttendanceCode(pupilSlug, req.user.schoolId, req.user.id)
    const pupil = await pupilService.findOneBySlugAndSchool(pupilSlug, req.user.schoolId)
    req.flash('info', `Reason removed for ${pupil.lastName}, ${pupil.foreName}`)
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
const viewPupilsNotTakingTheCheck = async function viewPupilsNotTakingTheCheck (req, res, next) {
  res.locals.pageTitle = 'Give a reason why a pupil is not taking the check'
  req.breadcrumbs(res.locals.pageTitle)
  const highlight = req.query.hl || []
  let checkWindowData
  let pinGenerationEligibilityData
  let hdfSubmitted
  try {
    const pupilsList = await pupilsNotTakingCheckService.getPupilsWithReasons(req.user.schoolId)
    checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData, req.user.timezone)
    hdfSubmitted = await headteacherDeclarationService.isHdfSubmittedForCurrentCheck(req.user.schoolId, checkWindowData && checkWindowData.id)
    // @ts-ignore - defined in server.js
    const isReadOnly = global.checkWindowPhase === checkWindowPhaseConsts.readOnlyAdmin
    const showSelectPupilButton = isReadOnly ? false : !hdfSubmitted
    return res.render('pupils-not-taking-the-check/select-pupils', {
      breadcrumbs: req.breadcrumbs(),
      pupilsList,
      messages: res.locals.messages,
      highlight,
      pinGenerationEligibilityData,
      hdfSubmitted,
      showSelectPupilButton,
      isReadOnly
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
