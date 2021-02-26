'use strict'

function getTestError (req, res) {
  res.locals.pageTitle = 'Test error page'
  req.breadcrumbs(res.locals.pageTitle)
  res.render('test-error.ejs', {
    breadcrumbs: req.breadcrumbs()
  })
}

module.exports = getTestError
