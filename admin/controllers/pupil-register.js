'use strict'

const pupilRegisterV2Service = require('../services/pupil-register-v2.service')
const checkWindowV2Service = require('../services/check-window-v2.service')
const businessAvailabilityService = require('../services/business-availability.service')
const incompleteChecksPresenter = require('../helpers/incomplete-checks-presenter')

const listPupils = async (req, res, next) => {
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

  const incompletePupils = incompleteChecksPresenter.getPupilWithIncompleteChecks(pupilsFormatted)

  req.breadcrumbs(res.locals.pageTitle)
  let { hl } = req.query
  if (hl) {
    hl = JSON.parse(hl)
    hl = typeof hl === 'string' ? JSON.parse(hl) : hl
  }

  res.render(pupilsListView, {
    highlight: hl && new Set(hl),
    pupils: pupilsFormatted,
    breadcrumbs: req.breadcrumbs(),
    availabilityData,
    incompletePupils
  })
}

module.exports = { listPupils }
