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
  let generatedAt
  let redisResult
  let groups
  let checkWindow
  let isHdfSubmitted
  try {
    checkWindow = await checkWindowV2Service.getActiveCheckWindow()
    redisResult = await resultService.getPupilResultData(req.user.schoolId)
    pupilResultData = redisResult && redisResult.pupilResultData
    generatedAt = redisResult && redisResult.generatedAt
    groups = await groupService.getGroups(req.user.schoolId)
    isHdfSubmitted = await headteacherDeclarationService.isHdfSubmittedForCurrentCheck(req.user.School, checkWindow && checkWindow.id)
  } catch (error) {
    return next(error)
  }
  const currentDate = moment.tz(req.user.timezone || config.DEFAULT_TIMEZONE)

  const resultsOpeningDay = resultPageAvailabilityService.getResultsOpeningDate(currentDate, checkWindow.checkEndDate)

  const isResultsFeatureAccessible =
    resultPageAvailabilityService.isResultsFeatureAccessible(currentDate, resultsOpeningDay)

  const isResultsPageAccessibleForIncompleteHdfs =
    resultPageAvailabilityService.isResultsPageAccessibleForIncompleteHdfs(currentDate, checkWindow, isHdfSubmitted)

  if (!isResultsFeatureAccessible || !redisResult) {
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
  const pupilWithStatuses = resultService.assignResultStatuses(pupilResultData)
  const pupilData = resultPresenter.getResultsViewData(pupilWithStatuses)
  generatedAt = resultPresenter.formatGeneratedAtValue(generatedAt)
  return res.render('results/view-results', {
    pupilData,
    generatedAt,
    maxMark: config.LINES_PER_CHECK_FORM,
    groups,
    breadcrumbs: req.breadcrumbs()
  })
}

module.exports = controller
