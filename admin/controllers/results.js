'use strict'
const moment = require('moment-timezone')
const R = require('ramda')

const checkWindowV2Service = require('../services/check-window-v2.service')
const config = require('../config')
const ctfService = require('../services/ctf/ctf.service')
const groupService = require('../services/group.service')
const headteacherDeclarationService = require('../services/headteacher-declaration.service')
const resultPageAvailabilityService = require('../services/results-page-availability.service')
const resultPresenter = require('../helpers/result-presenter')
const resultService = require('../services/result.service')
const checkWindowPhaseConsts = require('../lib/consts/check-window-phase')

const controller = {}

/**
 * View results page
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
controller.getViewResultsPage = async function getViewResultsPage (req, res, next) {
  res.locals.pageTitle = 'Results'
  req.breadcrumbs('Results')
  let pupilResultData
  let rawResultData
  let groups
  let checkWindow
  let isHdfSubmitted
  try {
    checkWindow = await checkWindowV2Service.getActiveCheckWindow()
    groups = await groupService.getGroups(req.user.schoolId)
    isHdfSubmitted = await headteacherDeclarationService.isHdfSubmittedForCurrentCheck(req.user.schoolId, checkWindow && checkWindow.id)
  } catch (error) {
    return next(error)
  }
  const currentDate = moment.tz(req.user.timezone || config.DEFAULT_TIMEZONE)

  const resultsOpeningDay = resultPageAvailabilityService.getResultsOpeningDate(currentDate, checkWindow.checkEndDate)

  const isResultsFeatureAccessible =
    resultPageAvailabilityService.isResultsFeatureAccessible(currentDate, resultsOpeningDay)

  const isResultsPageAccessibleForIncompleteHdfs =
    resultPageAvailabilityService.isResultsPageAccessibleForIncompleteHdfs(currentDate, checkWindow, isHdfSubmitted)

  if (!isResultsFeatureAccessible) {
    return res.render('results/view-unavailable-results', {
      breadcrumbs: req.breadcrumbs()
    })
  }

  if (!isHdfSubmitted && !isResultsPageAccessibleForIncompleteHdfs) {
    return res.render('results/view-incomplete-hdf', {
      resultsOpeningDate: resultPresenter.formatResultsOpeningDate(resultsOpeningDay),
      breadcrumbs: req.breadcrumbs()
    })
  }

  try {
    rawResultData = await resultService.getPupilResultData(req.user.schoolId)
    if (rawResultData.pupils && Array.isArray(rawResultData.pupils) && rawResultData.pupils.length > 0) {
      pupilResultData = rawResultData.pupils.map(p => resultPresenter.presentPupilData(p))
    }
  } catch (error) {
    return next(error)
  }

  if (!pupilResultData) {
    return res.render('results/view-results-not-found', {
      breadcrumbs: req.breadcrumbs()
    })
  }
  const generatedAt = resultPresenter.formatGeneratedAtValue(rawResultData.generatedAt)
  // @ts-ignore - defined in server.js
  const checkWindowPhaseIsReadOnly = global.checkWindowPhase === checkWindowPhaseConsts.readOnlyAdmin

  return res.render('results/view-results', {
    pupilData: pupilResultData,
    isHdfSubmitted,
    generatedAt,
    maxMark: config.LINES_PER_CHECK_FORM,
    groups,
    breadcrumbs: req.breadcrumbs(),
    checkWindowPhaseIsReadOnly
  })
}

controller.getCtfDownload = async function getCtfDownload (req, res, next) {
  if (!R.path(['user', 'schoolId'], req)) {
    return next(new Error('School ID Missing'))
  }
  try {
    const xml = await ctfService.getSchoolResultDataAsXmlString(req.user.schoolId, req.user.timezone)
    const dfeNumber = req.user.School
    if (!req.query.inline) {
      res.attachment(`${dfeNumber}_KS2_${dfeNumber}_001.xml`)
    }
    res.header('Content-type', 'text/xml')
    res.send(xml)
  } catch (error) {
    next(error)
  }
}

module.exports = controller
