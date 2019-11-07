'use strict'

const dateService = require('../services/date.service')
const logger = require('../services/log.service').getLogger()
const testDeveloperReportService = require('../services/test-developer-report.service')
const config = require('../config')

/**
 * Display landing page for 'test developer' role.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
const getTestDeveloperHomePage = async (req, res, next) => {
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

/**
 * Download pupil check data view.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
const getDownloadPupilCheckData = async (req, res, next) => {
  res.locals.pageTitle = 'Download pupil check data'
  req.breadcrumbs(res.locals.pageTitle)

  let psychometricianReport
  try {
    psychometricianReport = await testDeveloperReportService.getReportMeta()
  } catch (error) {
    return next(error)
  }

  if (psychometricianReport) {
    psychometricianReport.fileName = psychometricianReport.fileName.replace(/\.zip$/, '')
    psychometricianReport.dateGenerated = dateService.formatDateAndTime(psychometricianReport.createdAt.tz(config.DEFAULT_TIMEZONE))
  }

  res.render('test-developer/download-pupil-check-data', {
    breadcrumbs: req.breadcrumbs(),
    psychometricianReport
  })
}

/**
 * Download pupil check data ZIP file.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
const getFileDownloadPupilCheckData = async (req, res, next) => {
  let psychometricianReport
  try {
    psychometricianReport = await testDeveloperReportService.getReportMeta(req.params.urlSlug)
    if (!psychometricianReport) {
      return res.redirect('/test-developer/download-pupil-check-data')
    }
  } catch (error) {
    req.flash('error', error.message)
    return res.redirect('/test-developer/download-pupil-check-data')
  }

  try {
    res.setHeader('Content-type', 'application/zip')
    const fileName = `pupil-check-data-${dateService.formatFileName(psychometricianReport.createdAt)}.zip`
    res.setHeader('Content-disposition', `attachment; filename="${fileName}"`)
    await testDeveloperReportService.downloadFile(psychometricianReport.container, psychometricianReport.fileName, res)
  } catch (error) {
    logger.error(error)
    return next(error)
  }
}

module.exports = {
  getDownloadPupilCheckData,
  getFileDownloadPupilCheckData,
  getTestDeveloperHomePage
}
