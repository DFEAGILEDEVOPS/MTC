const R = require('ramda')
const accessArrangementsService = require('../services/access-arrangements.service')
const checkWindowV2Service = require('../services/check-window-v2.service')
const pupilAccessArrangementsService = require('../services/pupil-access-arrangements.service')
const pupilAccessArrangementsEditService = require('../services/pupil-access-arrangements-edit.service')
const questionReaderReasonsService = require('../services/question-reader-reasons.service')
const schoolHomeFeatureEligibilityPresenter = require('../helpers/school-home-feature-eligibility-presenter')
const accessArrangementsOverviewPresenter = require('../helpers/access-arrangements-overview-presenter')
const businessAvailabilityService = require('../services/business-availability.service')
const ValidationError = require('../lib/validation-error')
const accessArrangementsDescriptionsPresenter = require('../helpers/access-arrangements-descriptions-presenter')
const aaViewModes = require('../lib/consts/access-arrangements-view-mode')
const { AccessArrangementsNotEditableError } = require('../error-types/access-arrangements-not-editable-error')

const controller = {
  /**
   * Acess arrangements overview
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  getOverview: async function getOverview (req, res, next) {
    res.locals.pageTitle = 'Enable access arrangements for pupils who need them'
    req.breadcrumbs(res.locals.pageTitle)
    let pupils
    const aaViewMode = await accessArrangementsService.getCurrentViewMode(req.user.timezone)
    const { hl } = req.query
    const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData, req.user.timezone)
    const availabilityData = await businessAvailabilityService.getAvailabilityData(req.user.schoolId, checkWindowData, req.user.timezone)

    try {
      pupils = await pupilAccessArrangementsService.getPupils(req.user.schoolId)
      // short circuit if unavailable
      if (aaViewMode === aaViewModes.unavailable) {
        return res.render('access-arrangements/unavailable-access-arrangements', {
          title: res.locals.pageTitle,
          breadcrumbs: req.breadcrumbs(),
          aaViewMode,
          availabilityData
        })
      }
    } catch (error) {
      return next(error)
    }

    const pupilsFormatted = accessArrangementsOverviewPresenter.getPresentationData(pupils, availabilityData, hl)
    const retroInputAssistantText = await accessArrangementsOverviewPresenter.getRetroInputAssistantText(availabilityData)

    return res.render('access-arrangements/overview', {
      highlight: hl,
      messages: res.locals.messages,
      breadcrumbs: req.breadcrumbs(),
      pinGenerationEligibilityData,
      pupilsFormatted,
      aaViewMode,
      title: res.locals.pageTitle,
      availabilityData,
      retroInputAssistantText,
      serviceMessages: res.locals.serviceMessages
    })
  },
  /**
 * Select access arrangements
 * @param req
 * @param res
 * @param next
 * @param error
 * @returns {Promise.<void>}
 */
  getSelectAccessArrangements: async function getSelectAccessArrangements (req, res, next, error = null) {
    res.locals.pageTitle = 'Select access arrangement for pupil'
    req.breadcrumbs('Enable access arrangements for pupils who need them', '/access-arrangements/overview')
    req.breadcrumbs('Select pupils and access arrangements')
    let accessArrangements
    let accessArrangementsViewData
    let questionReaderReasons
    let pupils
    try {
      const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
      accessArrangements = await accessArrangementsService.getAccessArrangements()
      accessArrangementsViewData = accessArrangementsDescriptionsPresenter
        .addReasonRequiredIndication(accessArrangementsDescriptionsPresenter.getPresentationData(accessArrangements))
      questionReaderReasons = await questionReaderReasonsService.getQuestionReaderReasons()
      pupils = await pupilAccessArrangementsService.getEligiblePupilsWithFullNames(req.user.schoolId)
      const availabilityData = await businessAvailabilityService.getAvailabilityData(req.user.schoolId, checkWindowData, req.user.timezone)
      if (!availabilityData.accessArrangementsAvailable) {
        return res.render('availability/section-unavailable', {
          title: res.locals.pageTitle,
          breadcrumbs: req.breadcrumbs()
        })
      }
    } catch (error) {
      return next(error)
    }
    return res.render('access-arrangements/select-access-arrangements', {
      breadcrumbs: req.breadcrumbs(),
      accessArrangementsViewData,
      questionReaderReasons,
      pupils,
      formData: req.body,
      error: error || new ValidationError()
    })
  },
  /**
   * Submit access arrangements for single pupil
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  postSubmitAccessArrangements: async function postSubmitAccessArrangements (req, res, next) {
    const aaViewMode = await accessArrangementsService.getCurrentViewMode(req.user.timezone)
    if (aaViewMode !== aaViewModes.edit) {
      throw new AccessArrangementsNotEditableError()
    }
    let pupil
    try {
      const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
      await businessAvailabilityService.determineAccessArrangementsEligibility(checkWindowData)
    } catch (error) {
      next(error)
    }
    try {
      const submittedData = R.pick([
        'accessArrangements',
        'inputAssistanceInformation',
        'nextButtonInformation',
        'questionReaderReason',
        'questionReaderOtherInformation',
        'isEditView',
        'pupilUrlSlug',
        'urlSlug'
      ], req.body)
      pupil = await accessArrangementsService.submit(submittedData, req.user.schoolId, req.user.id)
    } catch (error) {
      if (error.name === 'ValidationError') {
        const controllerMethod = !req.body.isEditView ? 'getSelectAccessArrangements' : 'getEditAccessArrangements'
        return controller[controllerMethod](req, res, next, error)
      }
      return next(error)
    }
    req.flash('info', `Access arrangements applied to ${pupil.lastName}, ${pupil.foreName}`)
    return res.redirect(`/access-arrangements/overview?hl=${pupil.urlSlug}`)
  },
  /**
   * Edit access arrangements for single pupil
   * @param req
   * @param res
   * @param next
   * @param error
   * @returns {Promise.<void>}
   */
  getEditAccessArrangements: async function getEditAccessArrangements (req, res, next, error = null) {
    const aaViewMode = await accessArrangementsService.getCurrentViewMode(req.user.timezone)
    if (aaViewMode !== aaViewModes.edit) {
      throw new AccessArrangementsNotEditableError()
    }
    res.locals.pageTitle = 'Edit access arrangement for pupil'
    req.breadcrumbs('Enable access arrangements for pupils who need them', '/access-arrangements/overview')
    req.breadcrumbs('Edit pupils and access arrangements')

    try {
      const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
      await businessAvailabilityService.determineAccessArrangementsEligibility(checkWindowData)
    } catch (error) {
      next(error)
    }

    let accessArrangements
    let accessArrangementsViewData
    let questionReaderReasons
    let formData
    const pupilUrlSlug = req.params.pupilUrlSlug || req.body.urlSlug
    const schoolId = req.user.schoolId
    try {
      const submittedData = R.pick([
        'accessArrangements',
        'inputAssistanceInformation',
        'nextButtonInformation',
        'questionReaderReason',
        'questionReaderOtherInformation',
        'isEditView',
        'urlSlug'
      ], req.body)
      formData = await pupilAccessArrangementsEditService.getEditData(submittedData, pupilUrlSlug, schoolId)
      accessArrangements = await accessArrangementsService.getAccessArrangements()
      accessArrangementsViewData = accessArrangementsDescriptionsPresenter
        .addReasonRequiredIndication(accessArrangementsDescriptionsPresenter.getPresentationData(accessArrangements))
      questionReaderReasons = await questionReaderReasonsService.getQuestionReaderReasons()
    } catch (error) {
      return next(error)
    }
    return res.render('access-arrangements/select-access-arrangements', {
      breadcrumbs: req.breadcrumbs(),
      accessArrangementsViewData,
      questionReaderReasons,
      formData,
      error: error || new ValidationError()
    })
  },
  /**
   * Delete access arrangements for single pupil (unused)
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  getDeleteAccessArrangements: async function getDeleteAccessArrangements (req, res, next) {
    const aaViewMode = await accessArrangementsService.getCurrentViewMode(req.user.timezone)
    if (aaViewMode !== aaViewModes.edit) {
      return next(new AccessArrangementsNotEditableError())
    }
    let pupil
    try {
      const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
      await businessAvailabilityService.determineAccessArrangementsEligibility(checkWindowData)
      const pupilUrlSlug = req.params.pupilUrlSlug || req.body.urlSlug
      pupil = await pupilAccessArrangementsService.deletePupilAccessArrangements(pupilUrlSlug, req.user.schoolId)
    } catch (error) {
      return next(error)
    }
    req.flash('deleteInfo', `Access arrangements removed for ${pupil.lastName}, ${pupil.foreName}`)
    return res.redirect(`/access-arrangements/overview?hl=${pupil.urlSlug}`)
  }
}

module.exports = controller
