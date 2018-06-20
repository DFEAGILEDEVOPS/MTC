const pupilIdentificationFlag = require('../services/pupil-identification-flag.service')
const restartService = require('../services/restart.service')
const groupService = require('../services/group.service')
const restartValidator = require('../lib/validator/restart-validator')
const ValidationError = require('../lib/validation-error')

const controller = {}

controller.getRestartOverview = async (req, res, next) => {
  res.locals.pageTitle = 'Restarts'
  req.breadcrumbs(res.locals.pageTitle)
  let restarts
  try {
    restarts = await restartService.getSubmittedRestarts(req.user.School)
  } catch (error) {
    return next(error)
  }
  let { hl } = req.query
  if (hl) {
    hl = hl.split(',').map(h => decodeURIComponent(h))
  }
  return res.render('restart/restart-overview', {
    highlight: hl && new Set(hl),
    breadcrumbs: req.breadcrumbs(),
    restarts,
    messages: res.locals.messages
  })
}

controller.getSelectRestartList = async (req, res, next) => {
  res.locals.pageTitle = 'Select pupils for restart'
  req.breadcrumbs('Restarts', '/restart/overview')
  req.breadcrumbs(res.locals.pageTitle)
  let pupils
  let reasons
  let groups = []
  let groupIds = req.params.groupIds || ''

  try {
    pupils = await restartService.getPupils(req.user.School)
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

controller.postSubmitRestartList = async (req, res, next) => {
  const { pupil: pupilsList, restartReason, classDisruptionInfo, didNotCompleteInfo, restartFurtherInfo } = req.body
  if (!pupilsList || pupilsList.length === 0) {
    return res.redirect('/restart/select-restart-list')
  }
  const info = classDisruptionInfo || didNotCompleteInfo
  const validationError = restartValidator.validateReason(restartReason, info)
  if (validationError.hasError()) {
    const pageTitle = 'Select pupils for restart'
    res.locals.pageTitle = `Error: ${pageTitle}`
    req.breadcrumbs('Restarts', '/restart/overview')
    req.breadcrumbs(pageTitle)
    let pupils
    let reasons
    let groups = []
    let groupIds = req.params.groupIds || ''

    try {
      pupils = await restartService.getPupils(req.user.School)
      pupils = pupilIdentificationFlag.addIdentificationFlags(pupils)
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
  let submittedRestarts
  try {
    submittedRestarts = await restartService.restart(pupilsList, restartReason, classDisruptionInfo, didNotCompleteInfo, restartFurtherInfo, req.user.id, req.user.schoolId)
  } catch (error) {
    return next(error)
  }
  const restartInfo = submittedRestarts.length < 2 ? 'Restart made for 1 pupil' : `Restarts made for ${submittedRestarts.length} pupils`
  const restartIds = submittedRestarts && submittedRestarts.map(r => encodeURIComponent(r.insertId))
  const ids = restartIds.join()
  req.flash('info', restartInfo)
  return res.redirect(`/restart/overview?hl=${ids}`)
}

controller.postDeleteRestart = async (req, res, next) => {
  let deleted
  const pupilId = req.body && req.body.pupilId
  try {
    deleted = await restartService.markDeleted(pupilId, req.user.id)
  } catch (error) {
    return next(error)
  }
  req.flash('info', `Restart removed for ${deleted.lastName}, ${deleted.foreName}`)
  return res.redirect('/restart/overview')
}

module.exports = controller
