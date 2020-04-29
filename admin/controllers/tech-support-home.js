'use strict'

const controller = {}

controller.getTechSupportHomePage = async (req, res, next) => {
  res.locals.pageTitle = 'Tech Support Homepage'
  try {
    return res.render('tech-support/home', {
      breadcrumbs: [{ name: 'Tech Support Home' }]
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = controller
