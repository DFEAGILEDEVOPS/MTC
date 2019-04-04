'use strict'

const pupilIdentificationFlag = require('../services/pupil-identification-flag.service')
const pupilRegisterService = require('../services/pupil-register.service')
const checkWindowV2Service = require('../services/check-window-v2.service')
const businessAvailabilityService = require('../services/business-availability.service')
const featureToggles = require('feature-toggles')

const listPupils = async (req, res, next) => {
  res.locals.pageTitle = 'Pupil register'
  const sortField = req.params.sortField === undefined ? 'name' : req.params.sortField
  const sortDirection = req.params.sortDirection === undefined ? 'asc' : req.params.sortDirection

  let checkWindowData
  let availabilityData
  let pupilsFormatted = []
  try {
    checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    availabilityData = await businessAvailabilityService.getAvailabilityData(req.user.School, checkWindowData)
    pupilsFormatted = await pupilRegisterService.getPupilRegister(req.user.schoolId, sortDirection)
  } catch (error) {
    next(error)
  }

  req.breadcrumbs(res.locals.pageTitle)
  let { hl } = req.query
  if (hl) {
    hl = JSON.parse(hl)
    hl = typeof hl === 'string' ? JSON.parse(hl) : hl
  }

  res.render('pupil-register/pupils-list', {
    highlight: hl && new Set(hl),
    pupils: pupilsFormatted,
    breadcrumbs: req.breadcrumbs(),
    availabilityData
  })
}

module.exports = { listPupils }
