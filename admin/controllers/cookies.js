'use strict'

const monitor = require('../helpers/monitor')

const getCookiesPage = async (req, res) => {
  res.locals.pageTitle = 'Cookies'
  req.breadcrumbs(res.locals.pageTitle)
  res.render('cookies.ejs', {
    breadcrumbs: req.breadcrumbs()
  })
}

module.exports = monitor('cookies.controller', { getCookiesPage })
