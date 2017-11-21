const getRestartOverview = async (req, res) => {
  res.locals.pageTitle = 'Restarts'
  req.breadcrumbs(res.locals.pageTitle)
  return res.render('restart/restart-overview', {
    breadcrumbs: req.breadcrumbs()
  })
}

const getSelectRestartList = async (req, res) => {
  res.locals.pageTitle = 'Select pupils for restart'
  req.breadcrumbs(res.locals.pageTitle)
  return res.render('restart/select-restart-list', {
    breadcrumbs: req.breadcrumbs()
  })
}

module.exports = {
  getRestartOverview,
  getSelectRestartList
}
