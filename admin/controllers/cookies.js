'use strict'

const getCookiesPage = async (req, res) => {
  res.locals.pageTitle = 'Cookies'
  req.breadcrumbs(res.locals.pageTitle)
  res.render('cookies.ejs', {
    layout: 'gds-layout',
    breadcrumbs: req.breadcrumbs()
  })
}

module.exports = { getCookiesPage }
