
const controller = {}

controller.getOverview = async (req, res, next) => {
  res.locals.pageTitle = 'Access arrangements'
  req.breadcrumbs(res.locals.pageTitle)
  return res.render('access-arrangements/overview', {
    breadcrumbs: req.breadcrumbs()
  })
}

module.exports = controller
