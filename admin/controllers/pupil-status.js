// const config = require('../config')

const pupilStatusService = require('../services/pupil-status.service')

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
  try {
    pupilStatusData = await pupilStatusService.getPupilStatusData(req.user.schoolId)
  } catch (error) {
    return next(error)
  }
  return res.render('pupil-status/view-pupil-status', {
    breadcrumbs: req.breadcrumbs(),
    pupils: pupilStatusData
  })
}

module.exports = controller
