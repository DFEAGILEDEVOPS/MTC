const accessArrangementsService = require('../services/access-arrangements.service')

const controller = {}

controller.getOverview = async (req, res, next) => {
  res.locals.pageTitle = 'Access arrangements'
  req.breadcrumbs(res.locals.pageTitle)
  return res.render('access-arrangements/overview', {
    breadcrumbs: req.breadcrumbs()
  })
}

controller.getSelectAccessArrangements = async (req, res, next) => {
  res.locals.pageTitle = 'Select access arrangement for pupil'
  req.breadcrumbs(res.locals.pageTitle)
  let accessArrangements
  try {
    accessArrangements = await accessArrangementsService.getAccessArrangements()
  } catch (error) {
    return next(error)
  }
  return res.render('access-arrangements/select-access-arrangements', {
    breadcrumbs: req.breadcrumbs(),
    accessArrangements
  })
}

module.exports = controller
