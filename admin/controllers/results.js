'use strict'
const moment = require('moment-timezone')

const config = require('../config')
const groupService = require('../services/group.service')
const checkWindowV2Service = require('../services/check-window-v2.service')
const resultService = require('../services/result.service')
const resultPresenter = require('../helpers/result-presenter')
const headteacherDeclarationService = require('../services/headteacher-declaration.service')
const resultPageAvailabilityService = require('../services/results-page-availability.service')

const controller = {}

/**
 * View results page
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
controller.getViewResultsPage = async (req, res, next) => {
  res.locals.pageTitle = 'Provisional results'
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

  return res.render('results/view-results', {
    pupilData: pupilResultData,
    generatedAt,
    maxMark: config.LINES_PER_CHECK_FORM,
    groups,
    breadcrumbs: req.breadcrumbs()
  })
}

module.exports = controller
