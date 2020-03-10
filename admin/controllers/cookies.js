'use strict'

const getCookiesForm = async (req, res) => {
  res.locals.pageTitle = 'Cookies on MTC'
  req.breadcrumbs(res.locals.pageTitle)
  res.render('cookies-form.ejs', {
    breadcrumbs: req.breadcrumbs()
  })
}

const getCookiesMtc = async (req, res) => {
  res.locals.pageTitle = 'Cookies'
  req.breadcrumbs(res.locals.pageTitle)
  res.render('cookies-mtc.ejs', {
    breadcrumbs: req.breadcrumbs()
  })
}

module.exports = { getCookiesForm, getCookiesMtc }
