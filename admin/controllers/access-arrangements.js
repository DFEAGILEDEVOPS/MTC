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

const controller = {}

/**
 * Acess arrangements overview
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
controller.getOverview = async (req, res, next) => {
  res.locals.pageTitle = 'Access arrangements'
  req.breadcrumbs(res.locals.pageTitle)
  let pupils
  let pinGenerationEligibilityData
  let checkWindowData
  let availabilityData
  try {
    pupils = await pupilAccessArrangementsService.getPupils(req.user.School)
    checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData, req.user.timezone)
    availabilityData = await businessAvailabilityService.getAvailabilityData(req.user.School, checkWindowData, req.user.timezone)
    if (!availabilityData.accessArrangementsAvailable) {
      return res.render('availability/section-unavailable', {
        title: res.locals.pageTitle,
        breadcrumbs: req.breadcrumbs()
      })
    }
  } catch (error) {
    return next(error)
  }
  const { hl } = req.query

  // TODO: move to presenter
  const pupilsFormatted = accessArrangementsOverviewPresenter.getPresentationData(pupils, availabilityData, hl)

  return res.render('access-arrangements/overview', {
    highlight: hl,
    messages: res.locals.messages,
    breadcrumbs: req.breadcrumbs(),
    pinGenerationEligibilityData,
    pupilsFormatted,
    availabilityData
  })
}

/**
 * Select access arrangements
 * @param req
 * @param res
 * @param next
 * @param error
 * @returns {Promise.<void>}
 */
controller.getSelectAccessArrangements = async (req, res, next, error = null) => {
  res.locals.pageTitle = 'Select access arrangement for pupil'
  req.breadcrumbs('Access arrangements', '/access-arrangements/overview')
  req.breadcrumbs('Select pupils and access arrangements')
  let accessArrangements
  let questionReaderReasons
  let pupils
  try {
    const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    accessArrangements = await accessArrangementsService.getAccessArrangements()
    questionReaderReasons = await questionReaderReasonsService.getQuestionReaderReasons()
    pupils = await pupilAccessArrangementsService.getEligiblePupilsWithFullNames(req.user.School)
    const availabilityData = await businessAvailabilityService.getAvailabilityData(req.user.School, checkWindowData, req.user.timezone)
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
    accessArrangements,
    questionReaderReasons,
    pupils,
    formData: req.body,
    error: error || new ValidationError()
  })
}
/**
 * Submit access arrangements for single pupil
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
controller.postSubmitAccessArrangements = async (req, res, next) => {
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
    pupil = await accessArrangementsService.submit(submittedData, req.user.School, req.user.id)
  } catch (error) {
    if (error.name === 'ValidationError') {
      const controllerMethod = !req.body.isEditView ? 'getSelectAccessArrangements' : 'getEditAccessArrangements'
      return controller[controllerMethod](req, res, next, error)
    }
    return next(error)
  }
  req.flash('info', `Access arrangements applied to ${pupil.lastName}, ${pupil.foreName}`)
  return res.redirect(`/access-arrangements/overview?hl=${pupil.urlSlug}`)
}

/**
 * Edit access arrangements for single pupil
 * @param req
 * @param res
 * @param next
 * @param error
 * @returns {Promise.<void>}
 */
controller.getEditAccessArrangements = async (req, res, next, error) => {
  res.locals.pageTitle = 'Edit access arrangement for pupil'
  req.breadcrumbs('Access arrangements', '/access-arrangements/overview')
  req.breadcrumbs('Edit pupils and access arrangements')

  try {
    const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    await businessAvailabilityService.determineAccessArrangementsEligibility(checkWindowData)
  } catch (error) {
    next(error)
  }

  let accessArrangements
  let questionReaderReasons
  let formData
  const pupilUrlSlug = req.params.pupilUrlSlug || req.body.urlSlug
  const dfeNumber = req.user.School
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
    formData = await pupilAccessArrangementsEditService.getEditData(submittedData, pupilUrlSlug, dfeNumber)
    accessArrangements = await accessArrangementsService.getAccessArrangements()
    questionReaderReasons = await questionReaderReasonsService.getQuestionReaderReasons()
  } catch (error) {
    return next(error)
  }
  return res.render('access-arrangements/select-access-arrangements', {
    breadcrumbs: req.breadcrumbs(),
    accessArrangements,
    questionReaderReasons,
    formData,
    error: error || new ValidationError()
  })
}

/**
 * Delete access arrangements for single pupil
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
controller.getDeleteAccessArrangements = async (req, res, next) => {
  const dfeNumber = req.user.School
  let pupil
  try {
    const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    await businessAvailabilityService.determineAccessArrangementsEligibility(checkWindowData)
    const pupilUrlSlug = req.params.pupilUrlSlug || req.body.urlSlug
    pupil = await pupilAccessArrangementsService.deletePupilAccessArrangements(pupilUrlSlug, dfeNumber)
  } catch (error) {
    return next(error)
  }
  req.flash('deleteInfo', `Access arrangements removed for ${pupil.lastName}, ${pupil.foreName}`)
  return res.redirect(`/access-arrangements/overview?hl=${pupil.urlSlug}`)
}

module.exports = controller
