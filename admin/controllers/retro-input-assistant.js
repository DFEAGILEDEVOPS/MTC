'use strict'

const checkWindowV2Service = require('../services/check-window-v2.service')
const businessAvailabilityService = require('../services/business-availability.service')
const ValidationError = require('../lib/validation-error')
const retroInputAssistantService = require('../services/retro-input-assistant.service')

const controller = {}

controller.getAddRetroInputAssistant = async (req, res, next, error = null) => {
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
    pupils = await retroInputAssistantService.getEligiblePupilsWithFullNames(req.user.schoolId)
    console.dir(pupils)
  } catch (error) {
    return next(error)
  }
  return res.render('access-arrangements/retro-add-input-assistant', {
    breadcrumbs: req.breadcrumbs(),
    pupils: pupils,
    error: error || new ValidationError(),
    formData: req.body
  })
}

controller.postSubmitRetroInputAssistant = async (req, res, next) => {
  const saveData = {
    firstName: req.body.firstname,
    lastName: req.body.lastname,
    reason: req.body.reason,
    pupilUuid: req.body.pupilUrlSlug,
    userId: req.user.id
  }

  try {
    await retroInputAssistantService.save(saveData)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return controller.getAddRetroInputAssistant(req, res, next, error)
    }
    return next(error)
  }
  req.flash('info', 'Retrospective Input assistant added')
  res.redirect('/access-arrangements/overview')
}

module.exports = controller
