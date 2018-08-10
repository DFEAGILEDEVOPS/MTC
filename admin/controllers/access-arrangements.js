const accessArrangementsService = require('../services/access-arrangements.service')
const monitor = require('../helpers/monitor')

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
  req.breadcrumbs('Access arrangements', '/access-arrangements/overview')
  req.breadcrumbs('Select pupils and access arrangements')
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

module.exports = monitor('access-arrangements.controller', controller)
