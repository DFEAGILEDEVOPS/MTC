const restartService = require('../services/restart.service')
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
  try {
    pupils = await restartService.getPupils(req.user.School)
    reasons = await restartService.getReasons()
  } catch (error) {
    return next(error)
  }
  return res.render('restart/select-restart-list', {
    breadcrumbs: req.breadcrumbs(),
    pupils,
    reasons,
    error: new ValidationError()
  })
}

controller.postSubmitRestartList = async (req, res, next) => {
  const { pupil: pupilsList, restartReason, didNotCompleteInfo, restartFurtherInfo } = req.body
  if (!pupilsList || pupilsList.length === 0) {
    return res.redirect('/restart/select-restart-list')
  }
  const validationError = restartValidator.validateReason(restartReason, didNotCompleteInfo)
  if (validationError.hasError()) {
    const pageTitle = 'Select pupils for restart'
    res.locals.pageTitle = `Error: ${pageTitle}`
    req.breadcrumbs('Restarts', '/restart/overview')
    req.breadcrumbs(pageTitle)
    let pupils
    try {
      pupils = await restartService.getPupils(req.user.School)
    } catch (error) {
      return next(error)
    }
    return res.render('restart/select-restart-list', {
      breadcrumbs: req.breadcrumbs(),
      pupils,
      error: validationError
    })
  }
  let submittedPupils
  try {
    submittedPupils = await restartService.restart(pupilsList, restartReason, didNotCompleteInfo, restartFurtherInfo, req.user.id)
  } catch (error) {
    return next(error)
  }
  const restartInfo = submittedPupils.length < 2 ? 'Restart made for 1 pupil' : `Restarts made for ${submittedPupils.length} pupils`
  const restartIds = submittedPupils && submittedPupils.map(p => encodeURIComponent(p._id))
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
