'use strict'

const pupilRegisterV2Service = require('../services/pupil-register-v2.service')
const checkWindowV2Service = require('../services/check-window-v2.service')
const businessAvailabilityService = require('../services/business-availability.service')
const roles = require('../lib/consts/roles')
const checkWindowPhaseConsts = require('../lib/consts/check-window-phase')

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

  // const showAddPupilButtons = global.checkWindowPhase <= checkWindowPhaseConsts.officialCheck // Add buttons allowed up to the official check, but not after in the admin period, or the post admin period.
  const showAddPupilButtons = global.checkWindowPhase !== checkWindowPhaseConsts.readOnlyAdmin && global.checkWindowPhase !== checkWindowPhaseConsts.unavailable && global.checkWindowPhase !== checkWindowPhaseConsts.postCheckAdmin

  res.render(pupilsListView, {
    highlight: hl && new Set(hl),
    pupils: pupilsFormatted,
    breadcrumbs: req.breadcrumbs(),
    availabilityData,
    showPupilAdminLink: req.user.role === roles.staAdmin,
    showAddPupilButtons
  })
}

module.exports = { listPupils }
