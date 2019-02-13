const groupService = require('../services/group.service')
const checkWindowV2Service = require('../services/check-window-v2.service')
const resultService = require('../services/result.service')
const resultPresenter = require('../helpers/result-presenter')

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
  let pupils
  let groups
  let checkWindow
  let schoolScore
  try {
    checkWindow = await checkWindowV2Service.getActiveCheckWindow()
    pupils = await resultService.getPupilsWithResults(req.user.schoolId, checkWindow.id)
    schoolScore = await resultService.getSchoolScore(req.user.schoolId, checkWindow.id)
    groups = await groupService.getGroups(req.user.schoolId)
  } catch (error) {
    return next(error)
  }
  const pupilData = resultPresenter.getResultsViewData(pupils)
  req.breadcrumbs(res.locals.pageTitle)
  return res.render('results/view-results', {
    pupilData,
    groups,
    schoolScore,
    nationalScore: checkWindow.score,
    breadcrumbs: req.breadcrumbs()
  })
}

module.exports = controller
