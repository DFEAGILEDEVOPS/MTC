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
  hl = hl && hl.split(',')
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
  try {
    pupils = await restartService.getPupils(req.user.School)
  } catch (error) {
    return next(error)
  }
  return res.render('restart/select-restart-list', {
    breadcrumbs: req.breadcrumbs(),
    pupils,
    error: new ValidationError()
  })
}

controller.postSubmitRestartList = async (req, res, next) => {
  const { pupil: pupilsList, restartReason, didNotCompleteInfo, restartFurtherInfo } = req.body
  if (!pupilsList) {
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
    submittedPupils = await restartService.restart(pupilsList, restartReason, didNotCompleteInfo, restartFurtherInfo, req.user.UserName)
  } catch (error) {
    return next(error)
  }
  const restartInfo = submittedPupils.length < 2 ? '1 pupil' : `${submittedPupils.length} pupils`
  const restartIds = submittedPupils && submittedPupils.map(p => p._id)
  const ids = restartIds.join()
  req.flash('info', `Restarts made for ${restartInfo}`)
  return res.redirect(`/restart/overview?hl=${ids}`)
}

module.exports = controller
