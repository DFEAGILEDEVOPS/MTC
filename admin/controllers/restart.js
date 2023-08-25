const checkWindowV2Service = require('../services/check-window-v2.service')
const groupService = require('../services/group.service')

const restartService = require('../services/restart.service')
const restartValidator = require('../lib/validator/restart-validator')
const schoolHomeFeatureEligibilityPresenter = require('../helpers/school-home-feature-eligibility-presenter')
const businessAvailabilityService = require('../services/business-availability.service')
const ValidationError = require('../lib/validation-error')
const logger = require('../services/log.service').getLogger()
const pupilService = require('../services/pupil.service')
const { DiscretionaryRestartService } = require('../services/discretionary-restart.service/discretionary-restart.service')

const controller = {}

controller.getRestartOverview = async function getRestartOverview (req, res, next) {
  res.locals.pageTitle = 'Select pupils to restart the check'
  req.breadcrumbs(res.locals.pageTitle)

  let checkWindowData
  let restarts
  let pinGenerationEligibilityData
  let availabilityData
  try {
    console.log(`GUY: getting restarts...`)
    restarts = await restartService.getRestartsForSchool(req.user.schoolId)
    console.log(`GUY: got restarts.`)
    checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData, req.user.timezone)
    availabilityData = await businessAvailabilityService.getAvailabilityData(req.user.schoolId, checkWindowData, req.user.timezone)
    if (!availabilityData.restartsAvailable) {
      return res.render('availability/section-unavailable', {
        title: res.locals.pageTitle,
        breadcrumbs: req.breadcrumbs()
      })
    }
  } catch (error) {
    return next(error)
  }
  let { hl } = req.query
  if (hl) {
    hl = hl.split(',').map(h => decodeURIComponent(h))
  }
  return res.render('restart/restart-overview', {
    breadcrumbs: req.breadcrumbs(),
    highlight: hl && new Set(hl),
    messages: res.locals.messages,
    pinGenerationEligibilityData,
    restarts
  })
}

controller.getSelectRestartList = async function getSelectRestartList (req, res, next) {
  res.locals.pageTitle = 'Select pupils for restart'
  req.breadcrumbs('Select pupils to restart the check', '/restart/overview')
  req.breadcrumbs(res.locals.pageTitle)
  let pupils
  let reasons
  let groups = []
  const groupIds = req.params.groupIds || ''

  try {
    const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    const availabilityData = await businessAvailabilityService.getAvailabilityData(req.user.schoolId, checkWindowData, req.user.timezone)
    if (!availabilityData.restartsAvailable) {
      return res.render('availability/section-unavailable', {
        title: res.locals.pageTitle,
        breadcrumbs: req.breadcrumbs()
      })
    }
    pupils = await restartService.getPupilsEligibleForRestart(req.user.schoolId)
    reasons = await restartService.getReasons()

    if (pupils.length > 0) {
      groups = await groupService.findGroupsByPupil(req.user.schoolId, pupils)
    }
  } catch (error) {
    return next(error)
  }
  return res.render('restart/select-restart-list', {
    breadcrumbs: req.breadcrumbs(),
    pupils,
    reasons,
    groups,
    groupIds,
    error: new ValidationError()
  })
}

controller.postSubmitRestartList = async function postSubmitRestartList (req, res, next) {
  const { pupil: pupilsList, restartReason, classDisruptionInfo, didNotCompleteInfo, restartFurtherInfo } = req.body
  if (!pupilsList || pupilsList.length === 0) {
    return res.redirect('/restart/select-restart-list')
  }

  // After exceeding 20 items the request payload received contains object key-value pairs
  // Detecting and converting them to strings is necessary as part of the processing
  // This only works if the HTML form element is called: `name[]` rather than `name[530]` as with
  // the latter you will get an object when a single pupil is selected.
  const processedPupilsIds = pupilsList.map(p => typeof p === 'object' ? Object.values(p)[0] : p)

  try {
    const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    await businessAvailabilityService.determineRestartsEligibility(checkWindowData)
  } catch (error) {
    return next(error)
  }

  const info = classDisruptionInfo || didNotCompleteInfo
  const validationError = restartValidator.validateReason(restartReason, info)
  if (validationError.hasError()) {
    const pageTitle = 'Select pupils for restart'
    res.locals.pageTitle = `Error: ${pageTitle}`
    req.breadcrumbs('Select pupils to restart the check', '/restart/overview')
    req.breadcrumbs(pageTitle)
    let pupils
    let reasons
    let groups = []
    const groupIds = req.params.groupIds || ''

    try {
      pupils = await restartService.getPupilsEligibleForRestart(req.user.schoolId)
      reasons = await restartService.getReasons()
      if (pupils.length > 0) {
        groups = await groupService.findGroupsByPupil(req.user.schoolId, pupils)
      }
    } catch (error) {
      return next(error)
    }
    return res.render('restart/select-restart-list', {
      breadcrumbs: req.breadcrumbs(),
      pupils,
      reasons,
      groups,
      groupIds,
      error: validationError
    })
  }
  let pupilsRestarted
  try {
    const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    await businessAvailabilityService.determineRestartsEligibility(checkWindowData)
    pupilsRestarted = await restartService.restart(processedPupilsIds, restartReason, classDisruptionInfo, didNotCompleteInfo, restartFurtherInfo, req.user.id, req.user.schoolId)
  } catch (error) {
    return next(error)
  }
  const restartInfo = pupilsRestarted.length < 2 ? 'Restart made for 1 pupil' : `Restarts made for ${pupilsRestarted.length} pupils`
  const pupilUrlSlugs = pupilsRestarted && pupilsRestarted.map(p => encodeURIComponent(p.urlSlug))
  const pupilsToHighlight = pupilUrlSlugs.join()
  req.flash('info', restartInfo)
  return res.redirect(`/restart/overview?hl=${pupilsToHighlight}`)
}

controller.postDeleteRestart = async function postDeleteRestart (req, res, next) {
  let pupil
  const pupilSlug = req.body && req.body.pupil
  try {
    const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    await businessAvailabilityService.determineRestartsEligibility(checkWindowData)
    pupil = await restartService.markDeleted(pupilSlug, req.user.id, req.user.schoolId)
  } catch (error) {
    logger.error('Failed to mark restart as deleted', error)
    return next(error)
  }
  req.flash('info', `Restart removed for ${pupil.lastName}, ${pupil.foreName}`)
  return res.redirect('/restart/overview')
}

controller.postSubmitAllowDiscretionaryRestart = async function postSubmitAllowDiscretionaryRestart (req, res, next) {
  let pupil
  const pupilSlug = req.body && req.body.pupilSlug
  try {
    pupil = await pupilService.fetchOnePupilBySlug(pupilSlug, req.user.schoolId)
    if (pupil === null || pupil === undefined) {
      return next(new Error('Unknown pupil'))
    }
    await DiscretionaryRestartService.grantDiscretionaryRestart(pupilSlug, req.user.id)
    req.flash('info', `Discretionary restart allowed for ${pupil.foreName} ${pupil.lastName}`)
    return res.redirect(`/pupil-register/history/${encodeURIComponent(pupilSlug).toLowerCase()}`)
  } catch (error) {
    logger.error(`Failed to apply a discretionary restart for ${pupilSlug}`)
    return next(error)
  }
}

controller.postSubmitRevokeDiscretionaryRestart = async function postSubmitRevokeDiscretionaryRestart (req, res, next) {
  let pupil
  const pupilSlug = req.body && req.body.pupilSlug
  try {
    pupil = await pupilService.fetchOnePupilBySlug(pupilSlug, req.user.schoolId)
    if (pupil === null || pupil === undefined) {
      return next(new Error('Unknown pupil'))
    }
    await DiscretionaryRestartService.removeDiscretionaryRestart(pupilSlug, req.user.id)
    req.flash('info', `Discretionary restart revoked for ${pupil.foreName} ${pupil.lastName}`)
    return res.redirect(`/pupil-register/history/${encodeURIComponent(pupilSlug).toLowerCase()}`)
  } catch (error) {
    logger.error(`Failed to apply a discretionary restart for ${pupilSlug}`)
    return next(error)
  }
}

module.exports = controller
