const restartService = require('../services/restart.service')

const getRestartOverview = async (req, res) => {
  res.locals.pageTitle = 'Restarts'
  req.breadcrumbs(res.locals.pageTitle)
  return res.render('restart/restart-overview', {
    breadcrumbs: req.breadcrumbs()
  })
}

const getSelectRestartList = async (req, res, next) => {
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
    pupils
  })
}

module.exports = {
  getRestartOverview,
  getSelectRestartList
}
