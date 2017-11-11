const moment = require('moment')
const config = require('../config')

const getTestDeveloperHome = async (req, res, next) => {
  res.locals.pageTitle = 'Multiplication tables check for test development'
  try {
    req.breadcrumbs(res.locals.pageTitle)
    res.render('test-developer/test-developer-home', {
      breadcrumbs: req.breadcrumbs()
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getTestDeveloperHome
}
