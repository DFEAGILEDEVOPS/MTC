'use strict'

const pupilRegisterV2Service = require('../services/pupil-register-v2.service')
const checkWindowV2Service = require('../services/check-window-v2.service')
const businessAvailabilityService = require('../services/business-availability.service')
const roles = require('../lib/consts/roles')
const checkWindowPhaseConsts = require('../lib/consts/check-window-phase')

const checkShowAddPupilButton = function checkShowAddPupilButton (checkWindowPhase, availabilityData, userRole) {
  if (userRole === roles.staAdmin && !availabilityData.hdfSubmitted) {
    return true
  }
  const unavailablePhases = [checkWindowPhaseConsts.readOnlyAdmin, checkWindowPhaseConsts.unavailable, checkWindowPhaseConsts.postCheckAdmin]
  const isUnavailablePhase = unavailablePhases.some((cwp) => checkWindowPhase === cwp, checkWindowPhase)
  if (isUnavailablePhase) {
    return false
  }
  if (availabilityData.hdfSubmitted) {
    return false
  }
  return true
}

const checkShowAddMultiplePupilButton = function checkShowAddMultiplePupilButton (checkWindowPhase, availabilityData) {
  const unavailablePhases = [checkWindowPhaseConsts.readOnlyAdmin, checkWindowPhaseConsts.unavailable, checkWindowPhaseConsts.postCheckAdmin]
  const isUnavailablePhase = unavailablePhases.some((cwp) => checkWindowPhase === cwp, checkWindowPhase)
  if (isUnavailablePhase) {
    return false
  }
  if (availabilityData.hdfSubmitted) {
    return false
  }
  return true
}

const listPupils = async function listPupils (req, res, next) {
  res.locals.pageTitle = 'View, add or edit pupils on your school\'s register'

  let checkWindowData
  let availabilityData
  let pupilsFormatted = []
  let pupilsListView

  try {
    checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    availabilityData = await businessAvailabilityService.getAvailabilityData(req.user.schoolId, checkWindowData)
    pupilsFormatted = await pupilRegisterV2Service.getPupilRegister(req.user.schoolId)
    pupilsListView = 'pupil-register/pupils-list'
  } catch (error) {
    next(error)
  }

  req.breadcrumbs(res.locals.pageTitle)
  let { hl } = req.query
  if (hl) {
    hl = JSON.parse(hl)
    hl = typeof hl === 'string' ? JSON.parse(hl) : hl
  }

  /**
   * During the end admin phase, or the read only phase, STA ADMIN can still add single pupils.  We therefore need to
   * disable the add multiple pupils button if the role = STA-ADMIN and checkWindowPase is after the live check period.
   */
  const showAddPupilButton = checkShowAddPupilButton(global.checkWindowPhase, availabilityData, req.user.role)
  const showAddMultiplePupilButton = checkShowAddMultiplePupilButton(global.checkWindowPhase, availabilityData)
  const isStaAdmin = (req.user.role === roles.staAdmin)
  res.render(pupilsListView, {
    highlight: hl && new Set(hl),
    pupils: pupilsFormatted,
    breadcrumbs: req.breadcrumbs(),
    availabilityData,
    showPupilAdminLink: req.user.role === roles.staAdmin || req.user.role === roles.helpdesk,
    showAddPupilButton,
    showAddMultiplePupilButton,
    isStaAdmin

  })
}

module.exports = { listPupils }
