'use strict'

const getAccessibilityStatementPage = async (req, res) => {
  res.locals.pageTitle = 'Accessibility statement'
  req.breadcrumbs(res.locals.pageTitle)
  res.render('accessibility-statement.ejs', {
    layout: 'gds-layout',
    breadcrumbs: req.breadcrumbs()
  })
}

module.exports = { getAccessibilityStatementPage }
