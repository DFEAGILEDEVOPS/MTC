'use strict'

const checkWindowV2Service = require('../services/check-window-v2.service')
const pupilAccessArrangementsService = require('../services/pupil-access-arrangements.service')
const businessAvailabilityService = require('../services/business-availability.service')
const ValidationError = require('../lib/validation-error')
const retroInputAssistantService = require('../services/retro-input-assistant.service')

const controller = {}

controller.getAddRetroInputAssistant = async (req, res, next) => {
  res.locals.pageTitle = 'Record input assistant used for official check'
  req.breadcrumbs('Select pupils and access arrangements', 'select-access-arrangements')
  req.breadcrumbs('Record input assistant')

  try {
    const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    await businessAvailabilityService.determineAccessArrangementsEligibility(checkWindowData)
  } catch (error) {
    return next(error)
  }

  let pupils
  try {
    pupils = await pupilAccessArrangementsService.getEligiblePupilsWithFullNames(req.user.schoolId)
  } catch (error) {
    return next(error)
  }
  return res.render('access-arrangements/retro-add-input-assistant', {
    breadcrumbs: req.breadcrumbs(),
    pupils,
    error: new ValidationError(),
    formData: {}
  })
}

controller.postSubmitRetroInputAssistant = async (req, res, next) => {
  console.dir(req.body)
  await retroInputAssistantService.save(req.body)
  res.redirect('/access-arrangements/overview')
}

module.exports = controller
