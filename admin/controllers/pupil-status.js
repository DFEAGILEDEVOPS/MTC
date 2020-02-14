const checkWindowV2Service = require('../services/check-window-v2.service')
const pupilStatusService = require('../services/pupil-status.service')
const pupilStatusPresenter = require('../helpers/pupil-status-presenter')

const controller = {}

/**
 * View pupil status page
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
controller.getViewPupilStatus = async (req, res, next) => {
  res.locals.pageTitle = 'Pupil Status'
  req.breadcrumbs(res.locals.pageTitle)
  let pupilStatusData
  let pupilStatusViewData
  let checkWindowData
  try {
    checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    pupilStatusData = await pupilStatusService.getPupilStatusData(req.user.schoolId)
    pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupilStatusData, checkWindowData)
  } catch (error) {
    return next(error)
  }
  return res.render('pupil-status/view-pupil-status', {
    breadcrumbs: req.breadcrumbs(),
    pupilStatusViewData: pupilStatusViewData
  })
}

module.exports = controller
