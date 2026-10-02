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
    req.breadcrumbs(res.locals.pageTitle)
    const generate = req.query.count !== undefined
    let count = parseInt(req.query.count, 10) || 1
    if (count < 1) count = 1
    if (count > 20) count = 20
    const upns = []
    if (generate) {
      for (let i = 0; i < count; i++) {
        upns.push(upnGeneratorService.generateUpn())
      }
    }
    res.render('test-developer/upn-generator', {
      breadcrumbs: req.breadcrumbs(),
      upns,
      count
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getTestDeveloperHomePage,
  getUpnGenerator
}
