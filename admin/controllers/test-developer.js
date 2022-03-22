'use strict'

/**
 * Display landing page for 'test developer' role.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
const getTestDeveloperHomePage = async function getTestDeveloperHomePage (req, res, next) {
  res.locals.pageTitle = 'MTC for test development'
  try {
    req.breadcrumbs(res.locals.pageTitle)
    res.render('test-developer/test-developer-home', {
      breadcrumbs: ''
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getTestDeveloperHomePage
}
