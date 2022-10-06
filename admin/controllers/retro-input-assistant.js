'use strict'

const checkWindowV2Service = require('../services/check-window-v2.service')
const businessAvailabilityService = require('../services/business-availability.service')
const ValidationError = require('../lib/validation-error')
const retroInputAssistantService = require('../services/retro-input-assistant.service')
const { AccessArrangementsNotEditableError } = require('../error-types/access-arrangements-not-editable-error')
const accessArrangementsService = require('../services/access-arrangements.service')
const aaViewModes = require('../lib/consts/access-arrangements-view-mode')

const controller = {
  getAddRetroInputAssistant: async function getAddRetroInputAssistant (req, res, next, error = null) {
    res.locals.pageTitle = 'Record input assistant used for official check'
    req.breadcrumbs('Select pupils and access arrangements', 'select-access-arrangements')
    req.breadcrumbs('Record input assistant')

    const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    const availabilityData = await businessAvailabilityService.getAvailabilityData(req.user.schoolId, checkWindowData, req.user.timezone)
    if (availabilityData.hdfSubmitted === true) {
      throw new AccessArrangementsNotEditableError()
    }

    let pupils
    try {
      pupils = await retroInputAssistantService.getEligiblePupilsWithFullNames(req.user.schoolId)
    } catch (error) {
      return next(error)
    }
    return res.render('access-arrangements/retro-add-input-assistant', {
      breadcrumbs: req.breadcrumbs(),
      pupils,
      error: error || new ValidationError(),
      formData: req.body
    })
  },
  postSubmitRetroInputAssistant: async function postSubmitRetroInputAssistant (req, res, next) {
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
    res.redirect(`/access-arrangements/overview?hl=${saveData.pupilUuid}`)
  },
  /**
   * Delete retro input assistant for single pupil
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  getDeleteRetroInputAssistant: async function getDeleteRetroInputAssistant (req, res, next) {
    const aaViewMode = await accessArrangementsService.getCurrentViewMode(req.user.timezone)
    // TODO add this to add method?
    if (aaViewMode !== aaViewModes.edit) {
      return next(new AccessArrangementsNotEditableError())
    }
    let pupilUrlSlug
    try {
      const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
      await businessAvailabilityService.determineAccessArrangementsEligibility(checkWindowData)
      pupilUrlSlug = req.params.pupilUrlSlug || req.body.urlSlug
      await retroInputAssistantService.deleteFromCurrentCheck(pupilUrlSlug)
    } catch (error) {
      return next(error)
    }
    req.flash('deleteInfo', 'Input Assistant removed')
    return res.redirect(`/access-arrangements/overview?hl=${pupilUrlSlug}`)
  }
}

module.exports = controller
