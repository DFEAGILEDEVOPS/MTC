const R = require('ramda')

const config = require('../config')

const businessAvailabilityService = require('../services/business-availability.service')
const schoolDataService = require('../services/data-access/school.data.service')
const pinService = require('../services/pin.service')
const pinGenerationService = require('../services/pin-generation.service')
const pinGenerationV2Service = require('../services/pin-generation-v2.service')
const groupService = require('../services/group.service')
const dateService = require('../services/date.service')
const qrService = require('../services/qr.service')
const checkStartService = require('../services/check-start.service')
const checkWindowV2Service = require('../services/check-window-v2.service')
const checkWindowSanityCheckService = require('../services/check-window-sanity-check.service')

const getGeneratePinsOverview = async (req, res, next) => {
  if (!req.params || !req.params.pinEnv) {
    const error = new Error('Pin environment not provided')
    return next(error)
  }
  const { pinEnv } = req.params
  const isLiveCheck = pinEnv === 'live'
  res.locals.pinEnv = pinEnv
  res.locals.pageTitle = isLiveCheck ? 'Start the MTC - password and PINs' : 'Try it out - password and PINs'
  req.breadcrumbs(res.locals.pageTitle)

  const helplineNumber = config.Data.helplineNumber
  let pupils
  let checkWindowData
  let availabilityData
  try {
    checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    pupils = await pinGenerationV2Service.getPupilsWithActivePins(req.user.schoolId, isLiveCheck)
    availabilityData = await businessAvailabilityService.getAvailabilityData(req.user.School, checkWindowData, req.user.timezone)
    if (!availabilityData[`${pinEnv}PinsAvailable`]) {
      return res.render('availability/section-unavailable', {
        title: res.locals.pageTitle,
        breadcrumbs: req.breadcrumbs()
      })
    }
  } catch (err) {
    return next(err)
  }

  let error
  try {
    error = await checkWindowSanityCheckService.check(isLiveCheck)
  } catch (err) {
    return next(err)
  }
  return res.render('pupil-pin/generate-pins-overview', {
    breadcrumbs: req.breadcrumbs(),
    error,
    helplineNumber,
    pupils,
    pupilAppURL: config.PUPIL_APP_URL
  })
}

/**
 * Display a list of Pupils who can have a pin generated
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
const getGeneratePinsList = async (req, res, next) => {
  if (!req.params || !req.params.pinEnv) {
    const error = new Error('Pin environment not provided')
    return next(error)
  }
  const { pinEnv } = req.params
  const isLiveCheck = pinEnv === 'live'
  res.locals.pinEnv = pinEnv
  res.locals.pageTitle = 'Select pupils'
  req.breadcrumbs(
    isLiveCheck ? 'Start the MTC - password and PINs' : 'Try it out - password and PINs',
    `/pupil-pin/generate-${pinEnv}-pins-overview`)
  req.breadcrumbs(res.locals.pageTitle)

  let school
  let pupils
  let groups = []
  let groupIds = req.params.groupIds || ''
  let checkWindowData
  try {
    checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    const availabilityData = await businessAvailabilityService.getAvailabilityData(req.user.School, checkWindowData, req.user.timezone)
    if (!availabilityData[`${pinEnv}PinsAvailable`]) {
      return res.render('availability/section-unavailable', {
        title: res.locals.pageTitle,
        breadcrumbs: req.breadcrumbs()
      })
    }
    school = await schoolDataService.sqlFindOneByDfeNumber(req.user.School)
    if (!school) {
      return next(Error(`School [${req.user.school}] not found`))
    }

    pupils = await pinGenerationV2Service.getPupilsEligibleForPinGeneration(school.id, isLiveCheck)

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

const postGeneratePins = async function postGeneratePins (req, res, next) {
  if (!req.params || !req.params.pinEnv) {
    const error = new Error('Pin environment not provided')
    return next(error)
  }
  const { pinEnv } = req.params
  const isLiveCheck = pinEnv === 'live'
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
  let checkWindowData
  try {
    checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    await businessAvailabilityService.determinePinGenerationEligibility(isLiveCheck, checkWindowData, req.user.timezone)

    school = await schoolDataService.sqlFindOneByDfeNumber(req.user.School)
    if (!school) {
      return next(Error(`School [${req.user.school}] not found`))
    }
    const update = pinGenerationService.generateSchoolPassword(school)
    if (update) {
      await schoolDataService.sqlUpdate(R.assoc('id', school.id, update))
      school.pin = update.pin
    }

    // depends on school pin being ready
    await checkStartService.prepareCheck2(pupilsList, school, isLiveCheck)

    const pupilsText = pupilsList.length === 1 ? '1 pupil' : `${pupilsList.length} pupils`
    req.flash('info', `PINs generated for ${pupilsText}`)
  } catch (error) {
    return next(error)
  }
  return res.redirect(`/pupil-pin/view-and-print-${pinEnv}-pins`)
}

const getViewAndPrintPins = async (req, res, next) => {
  if (!req.params || !req.params.pinEnv) {
    const error = new Error('Pin environment not provided')
    return next(error)
  }
  const { pinEnv } = req.params
  const isLiveCheck = pinEnv === 'live'
  res.locals.pinEnv = pinEnv
  res.locals.pageTitle = `View and print PINs`
  req.breadcrumbs(
    isLiveCheck ? 'Start the MTC - password and PINs' : 'Try it out - password and PINs',
    `/pupil-pin/generate-${pinEnv}-pins-overview`)
  req.breadcrumbs(res.locals.pageTitle)

  const helplineNumber = config.Data.helplineNumber
  let pupils
  let school
  let error
  let qrDataURL
  const date = dateService.formatDayAndDate()
  let checkWindowData
  try {
    checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    const availabilityData = await businessAvailabilityService.getAvailabilityData(req.user.School, checkWindowData, req.user.timezone)
    if (!availabilityData[`${pinEnv}PinsAvailable`]) {
      return res.render('availability/section-unavailable', {
        title: res.locals.pageTitle,
        breadcrumbs: req.breadcrumbs()
      })
    }
    pupils = await pinGenerationV2Service.getPupilsWithActivePins(req.user.schoolId, isLiveCheck)
    if (pupils.length > 0) {
      pupils = await groupService.assignGroupsToPupils(req.user.schoolId, pupils)
    }
    school = await pinService.getActiveSchool(req.user.School)
    error = await checkWindowSanityCheckService.check(isLiveCheck)
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
  if (!req.params || !req.params.pinEnv) {
    const error = new Error('Pin environment not provided')
    return next(error)
  }
  const { pinEnv } = req.params
  const isLiveCheck = pinEnv === 'live'
  res.locals.pinEnv = pinEnv
  res.locals.pageTitle = `View and custom print PINs`
  req.breadcrumbs(
    isLiveCheck ? 'Start the MTC - password and PINs' : 'Try it out - password and PINs',
    `/pupil-pin/generate-${pinEnv}-pins-overview`)
  req.breadcrumbs(res.locals.pageTitle)

  const helplineNumber = config.Data.helplineNumber
  let pupils
  let groups
  let school
  let error
  let qrDataURL
  const date = dateService.formatDayAndDate()
  let checkWindowData
  try {
    checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    const availabilityData = await businessAvailabilityService.getAvailabilityData(req.user.School, checkWindowData, req.user.timezone)
    if (!availabilityData[`${pinEnv}PinsAvailable`]) {
      return res.render('availability/section-unavailable', {
        title: res.locals.pageTitle,
        breadcrumbs: req.breadcrumbs()
      })
    }
    pupils = await pinGenerationV2Service.getPupilsWithActivePins(req.user.schoolId, isLiveCheck)
    school = await pinService.getActiveSchool(req.user.School)
    error = await checkWindowSanityCheckService.check(isLiveCheck)
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

module.exports = {
  getGeneratePinsOverview,
  getGeneratePinsList,
  postGeneratePins,
  getViewAndPrintPins,
  getViewAndCustomPrintPins
}
