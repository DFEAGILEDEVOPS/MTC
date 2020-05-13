'use strict'

const controller = {}

controller.getHomePage = async (req, res, next) => {
  res.locals.pageTitle = 'Tech Support Homepage'
  try {
    return res.render('tech-support/home', {
      breadcrumbs: [{ name: 'Tech Support Home' }]
    })
  } catch (error) {
    return next(error)
  }
}

controller.getCheckViewPage = async (req, res, next) => {
  res.locals.pageTitle = 'Tech Support Check View'
  try {
    return res.render('tech-support/check-view', {
      breadcrumbs: [{ name: 'Tech Support Check View' }]
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = controller
