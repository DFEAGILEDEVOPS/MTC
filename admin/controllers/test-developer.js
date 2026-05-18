'use strict'

const upnGeneratorService = require('../services/upn-generator.service')

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

const getUpnGenerator = async function getUpnGenerator (req, res, next) {
  res.locals.pageTitle = 'Test UPN Generator'
  try {
    req.breadcrumbs('Home', '/test-developer/home')
    req.breadcrumbs(res.locals.pageTitle)
    const upn = upnGeneratorService.generateUpn()
    res.render('test-developer/upn-generator', {
      breadcrumbs: req.breadcrumbs(),
      upn
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getTestDeveloperHomePage,
  getUpnGenerator
}
