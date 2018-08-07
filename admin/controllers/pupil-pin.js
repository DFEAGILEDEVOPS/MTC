const R = require('ramda')
const config = require('../config')
const schoolDataService = require('../services/data-access/school.data.service')
const pinService = require('../services/pin.service')
const pinGenerationService = require('../services/pin-generation.service')
const groupService = require('../services/group.service')
const dateService = require('../services/date.service')
const qrService = require('../services/qr.service')
const checkStartService = require('../services/check-start.service')
const checkWindowSanityCheckService = require('../services/check-window-sanity-check.service')

const getGeneratePinsOverview = async (req, res, next) => {
  const pinEnv = (req.params && req.params.pinEnv === 'live') ? 'live' : 'familiarisation'
  res.locals.pinEnv = pinEnv
  res.locals.pageTitle = `PINs for ${pinEnv} check`
  req.breadcrumbs(res.locals.pageTitle)

  const helplineNumber = config.Data.helplineNumber
  let pupils
  try {
    pupils = await pinService.getPupilsWithActivePins(req.user.School, pinEnv)
  } catch (err) {
    return next(err)
  }
  let error
  try {
    error = await checkWindowSanityCheckService.check()
  } catch (err) {
    return next(err)
  }
  return res.render('pupil-pin/generate-pins-overview', {
    breadcrumbs: req.breadcrumbs(),
    error,
    helplineNumber,
    pupils
  })
}

const getGeneratePinsList = async (req, res, next) => {
  const pinEnv = (req.params && req.params.pinEnv === 'live') ? 'live' : 'familiarisation'
  res.locals.pinEnv = pinEnv
  res.locals.pageTitle = 'Select pupils'
  req.breadcrumbs(
    `PINs for ${pinEnv} check`,
    `/pupil-pin/generate-${pinEnv}-pins-overview`)
  req.breadcrumbs(res.locals.pageTitle)

  let school
  let pupils
  let groups = []
  let groupIds = req.params.groupIds || ''

  // TODO: data service call should be moved to a service
  try {
    school = await schoolDataService.sqlFindOneByDfeNumber(req.user.School)
    if (!school) {
      return next(Error(`School [${req.user.school}] not found`))
    }
    pupils = await pinGenerationService.getPupils(school.dfeNumber, pinEnv)
    if (pupils.length > 0) {
      groups = await groupService.findGroupsByPupil(req.user.schoolId, pupils)
    }
  } catch (error) {
    return next(error)
  }

  return res.render('pupil-pin/generate-pins-list', {
    breadcrumbs: req.breadcrumbs(),
    pupils,
    groups,
    groupIds
  })
}

const postGeneratePins = async (req, res, next) => {
  const pinEnv = (req.params && req.params.pinEnv === 'live') ? 'live' : 'familiarisation'
  let pupilsList
  // As the UI is naming the pupil field like this:  `pupil[0]` which is quite unnecessary
  // busboy provides either an array of values, or, sometimes an object where the key is the
  // array prefix.  The scalar check here is just to be safe.
  if (Array.isArray(req.body.pupil)) {
    pupilsList = req.body.pupil
  } else if (typeof req.body.pupil === 'object') {
    pupilsList = Object.values(req.body.pupil)
  } else {
    if (req.body.pupil) {
      pupilsList = [req.body.pupil]
    } else {
      pupilsList = []
    }
  }

  if (!Array.isArray(pupilsList) || pupilsList.length === 0) {
    return res.redirect(`/pupil-pin/generate-${pinEnv}-pins-list`)
  }
  let school
  try {
    await checkStartService.prepareCheck(pupilsList, req.user.School, req.user.schoolId, pinEnv)
    school = await schoolDataService.sqlFindOneByDfeNumber(req.user.School)
    if (!school) {
      return next(Error(`School [${req.user.school}] not found`))
    }
    const update = pinGenerationService.generateSchoolPassword(school)
    if (update) {
      await schoolDataService.sqlUpdate(R.assoc('id', school.id, update))
    }
    const pupilsText = pupilsList.length === 1 ? '1 pupil' : `${pupilsList.length} pupils`
    req.flash('info', `PINs generated for ${pupilsText}`)
  } catch (error) {
    return next(error)
  }
  return res.redirect(`/pupil-pin/view-and-print-${pinEnv}-pins`)
}

const getViewAndPrintPins = async (req, res, next) => {
  const pinEnv = (req.params && req.params.pinEnv === 'live') ? 'live' : 'familiarisation'
  res.locals.pinEnv = pinEnv
  res.locals.pageTitle = `View and print PINs`
  req.breadcrumbs(
    `PINs for ${pinEnv} check`,
    `/pupil-pin/generate-${pinEnv}-pins-overview`)
  req.breadcrumbs(res.locals.pageTitle)

  const helplineNumber = config.Data.helplineNumber
  let pupils
  let school
  let error
  let qrDataURL
  const date = dateService.formatDayAndDate()
  try {
    pupils = await pinService.getPupilsWithActivePins(req.user.School, pinEnv)
    if (pupils.length > 0) {
      pupils = await groupService.assignGroupsToPupils(req.user.schoolId, pupils)
    }
    school = await pinService.getActiveSchool(req.user.School)
    error = await checkWindowSanityCheckService.check()
    qrDataURL = await qrService.getDataURL(config.PUPIL_APP_URL)
  } catch (error) {
    return next(error)
  }
  return res.render('pupil-pin/view-and-print-pins', {
    breadcrumbs: req.breadcrumbs(),
    school,
    pupils,
    date,
    error,
    helplineNumber,
    qrDataURL,
    url: config.PUPIL_APP_URL
  })
}

const getViewAndCustomPrintPins = async (req, res, next) => {
  const pinEnv = (req.params && req.params.pinEnv === 'live') ? 'live' : 'familiarisation'
  res.locals.pinEnv = pinEnv
  res.locals.pageTitle = `View and custom print PINs`
  req.breadcrumbs(
    `PINs for ${pinEnv} check`,
    `/pupil-pin/generate-${pinEnv}-pins-overview`)
  req.breadcrumbs(res.locals.pageTitle)

  const helplineNumber = config.Data.helplineNumber
  let pupils
  let groups
  let school
  let error
  let qrDataURL
  const date = dateService.formatDayAndDate()
  try {
    pupils = await pinService.getPupilsWithActivePins(req.user.School, pinEnv)
    school = await pinService.getActiveSchool(req.user.School)
    error = await checkWindowSanityCheckService.check()
    if (pupils.length > 0) {
      groups = await groupService.findGroupsByPupil(req.user.schoolId, pupils)
      pupils = await groupService.assignGroupsToPupils(req.user.schoolId, pupils)
    }
    qrDataURL = await qrService.getDataURL(config.PUPIL_APP_URL)
  } catch (error) {
    return next(error)
  }
  return res.render('pupil-pin/view-and-custom-print-pins', {
    breadcrumbs: req.breadcrumbs(),
    school,
    pupils,
    groups,
    date,
    error,
    helplineNumber,
    qrDataURL,
    url: config.PUPIL_APP_URL
  })
}

/**
 * Get Print PINs.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const getPrintPins = async (req, res, next) => {
  const pinEnv = (req.params && req.params.pinEnv === 'live') ? 'live' : 'familiarisation'
  res.locals.pinEnv = pinEnv
  res.locals.pageTitle = 'Print pupils'
  let pupilsList
  // As the UI is naming the pupil field like this:  `pupil[0]` which is quite unnecessary
  // busboy provides either an array of values, or, sometimes an object where the key is the
  // array prefix.  The scalar check here is just to be safe.
  if (Array.isArray(req.query.pupil)) {
    pupilsList = req.query.pupil
  } else if (typeof req.query.pupil === 'object') {
    pupilsList = Object.values(req.query.pupil)
  } else {
    if (req.query.pupil) {
      pupilsList = [req.query.pupil]
    } else {
      pupilsList = []
    }
  }
  let pupils
  let school
  let qrDataURL
  const date = dateService.formatDayAndDate()
  const showAllPupils = (!Array.isArray(pupilsList) || pupilsList.length === 0)
  try {
    pupils = await pinService.getPupilsWithActivePins(req.user.School, pinEnv)
    if (!showAllPupils) {
      pupils = pupils.filter(p => pupilsList.includes(p.id.toString())) // req body IDs are strings
    }
    if (pupils.length > 0) {
      pupils = await groupService.assignGroupsToPupils(req.user.schoolId, pupils)
    }
    school = await pinService.getActiveSchool(req.user.School)
    qrDataURL = await qrService.getDataURL(config.PUPIL_APP_URL)
  } catch (error) {
    return next(error)
  }
  res.render('pupil-pin/pin-print', {
    pupils,
    school,
    date,
    qrDataURL,
    url: config.PUPIL_APP_URL
  })
}

module.exports = {
  getGeneratePinsOverview,
  getGeneratePinsList,
  postGeneratePins,
  getViewAndPrintPins,
  getViewAndCustomPrintPins,
  getPrintPins
}
