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
  let pupils
  let groups
  let checkWindow
  let schoolScoreRecord
  let schoolScore
  let isHdfSubmitted
  try {
    checkWindow = await checkWindowV2Service.getActiveCheckWindow()
    pupils = await resultService.getPupilsWithResults(req.user.schoolId, checkWindow.id)
    schoolScoreRecord = await resultService.getSchoolScore(req.user.schoolId, checkWindow.id)
    groups = await groupService.getGroups(req.user.schoolId)
    isHdfSubmitted = await headteacherDeclarationService.isHdfSubmittedForCurrentCheck(req.user.School)
  } catch (error) {
    return next(error)
  }
  const currentDate = moment.tz(req.user.timezone || config.DEFAULT_TIMEZONE)

  const isResultsPageAccessibleForSubmittedHdfs =
    resultPageAvailabilityService.isResultsPageAccessibleForSubmittedHdfs(currentDate, checkWindow, isHdfSubmitted)

  const isResultsPageAccessibleForUnsubmittedHdfs =
    resultPageAvailabilityService.isResultsPageAccessibleForUnsubmittedHdfs(currentDate, checkWindow, isHdfSubmitted)

  if (!isResultsPageAccessibleForSubmittedHdfs && !isResultsPageAccessibleForUnsubmittedHdfs) {
    return res.render('results/view-unavailable-results', {
      breadcrumbs: req.breadcrumbs()
    })
  }
  if (!schoolScoreRecord) {
    return res.render('availability/admin-window-unavailable', {
      isBeforeStartDate: checkWindow && currentDate.isBefore(checkWindow.adminStartDate)
    })
  }
  const pupilData = resultPresenter.getResultsViewData(pupils)
  const nationalScore = resultPresenter.getScoreWithOneDecimalPlace(checkWindow.score)
  schoolScore = resultPresenter.getScoreWithOneDecimalPlace(schoolScoreRecord && schoolScoreRecord.score)
  return res.render('results/view-results', {
    pupilData,
    groups,
    schoolScore,
    nationalScore,
    breadcrumbs: req.breadcrumbs()
  })
}

module.exports = controller
