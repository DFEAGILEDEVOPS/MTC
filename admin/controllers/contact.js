'use strict'

const getContactPage = async (req, res) => {
  res.locals.pageTitle = 'Contact'
  req.breadcrumbs(res.locals.pageTitle)
  res.render('contact.ejs', {
    breadcrumbs: req.breadcrumbs()
  })
}

module.exports = getContactPage
