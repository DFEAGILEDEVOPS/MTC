'use strict'

const monitor = require('../helpers/monitor')

const getPrivacyPage = async (req, res) => {
  res.locals.pageTitle = 'Privacy notice'
  req.breadcrumbs(res.locals.pageTitle)
  res.render('privacy.ejs', {
    breadcrumbs: req.breadcrumbs()
  })
}

module.exports = monitor('privacy.controller', { getPrivacyPage })
