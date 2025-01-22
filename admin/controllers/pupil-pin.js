'use strict'

const businessAvailabilityService = require('../services/business-availability.service')
const checkStartService = require('../services/check-start/check-start.service')
const checkWindowSanityCheckService = require('../services/check-window-sanity-check.service')
const checkWindowV2Service = require('../services/check-window-v2.service')
const config = require('../config')
const dateService = require('../services/date.service')
const groupService = require('../services/group.service')
const pinGenerationV2Service = require('../services/pin-generation-v2.service')
const pinService = require('../services/pin.service')
const pupilPinPresenter = require('../helpers/pupil-pin-presenter')
const qrService = require('../services/qr.service')
const schoolService = require('../services/school.service')
const schoolHomeFeatureEligibilityPresenter = require('../helpers/school-home-feature-eligibility-presenter')
const pupilPinPresentationService = require('../services/pupil-pin-presentation-service')
const moment = require('moment')

const getGeneratePinsOverview = async function getGeneratePinsOverview (req, res, next) {
  if (!req.params || !req.params.pinEnv) {
    const error = new Error('Pin environment not provided')
    return next(error)
  }
  const { pinEnv } = req.params
  const isLiveCheck = pinEnv === 'live'
  res.locals.pinEnv = pinEnv
  res.locals.pageTitle = isLiveCheck ? 'Generate school passwords and PINs for the official check' : 'Generate passwords and PINs for the try it out check'
  req.breadcrumbs(res.locals.pageTitle)
  const buttonText = isLiveCheck ? 'Generate password and PINs for the official check' : 'Generate password and PINs for the try it out check'

  const helplineNumber = config.Data.helplineNumber
  let pupils
  let checkWindowData
  let availabilityData
  try {
    checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    pupils = await pinGenerationV2Service.getPupilsWithActivePins(req.user.schoolId, isLiveCheck)
    availabilityData = await businessAvailabilityService.getAvailabilityData(req.user.schoolId, checkWindowData, req.user.timezone)
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
    buttonText
  })
}

/**
 * Display a list of Pupils who can have a pin generated
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
const getGeneratePinsList = async function getGeneratePinsList (req, res, next) {
  if (!req.params || !req.params.pinEnv) {
    const error = new Error('Pin environment not provided')
    return next(error)
  }
  const { pinEnv } = req.params
  const isLiveCheck = pinEnv === 'live'
  res.locals.pinEnv = pinEnv
  res.locals.pageTitle = 'Select pupils'
  req.breadcrumbs(
    isLiveCheck ? 'Generate school passwords and PINs for the official check' : 'Generate passwords and PINs for the try it out check',
    `/pupil-pin/generate-${pinEnv}-pins-overview`)
  req.breadcrumbs(res.locals.pageTitle)

  let school
  let pupils
  let groups = []
  const groupIds = req.params.groupIds || ''
  let checkWindowData
  try {
    checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    const availabilityData = await businessAvailabilityService.getAvailabilityData(req.user.schoolId, checkWindowData, req.user.timezone)
    if (!availabilityData[`${pinEnv}PinsAvailable`]) {
      return res.render('availability/section-unavailable', {
        title: res.locals.pageTitle,
        breadcrumbs: req.breadcrumbs()
      })
    }
    school = await schoolService.findOneById(req.user.schoolId)
    if (!school) {
      return next(Error(`School with id [${req.user.schoolId}] not found`))
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

  // convert the list of pupils from strings to numbers
  const pupilsListNums = pupilsList.map(s => parseInt(s, 10))

  if (!Array.isArray(pupilsList) || pupilsList.length === 0) {
    return res.redirect(`/pupil-pin/generate-${pinEnv}-pins-list`)
  }
  let school
  let checkWindowData
  try {
    checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    await businessAvailabilityService.determinePinGenerationEligibility(isLiveCheck, checkWindowData, req.user.timezone)
    school = await schoolService.findOneById(req.user.schoolId)
    if (!school) {
      return next(Error(`School with id [${req.user.schoolId}] not found`))
    }

    await checkStartService.prepareCheck2(
      pupilsListNums,
      req.user.School,
      req.user.schoolId,
      req.user.id,
      isLiveCheck,
      checkWindowData,
      school.timezone
    )
    const pupilsText = pupilsList.length === 1 ? '1 pupil' : `${pupilsList.length} pupils`
    const mode = isLiveCheck ? 'Official check' : 'Try it out check'
    req.flash('info', `${mode} PINs generated for ${pupilsText}`)
  } catch (error) {
    return next(error)
  }
  return res.redirect(`/pupil-pin/view-and-custom-print-${pinEnv}-pins`)
}

const getViewAndCustomPrintPins = async function getViewAndCustomPrintPins (req, res, next) {
  if (!req.params || !req.params.pinEnv) {
    const error = new Error('Pin environment not provided')
    return next(error)
  }
  const { pinEnv } = req.params
  const isLiveCheck = pinEnv === 'live'
  res.locals.pinEnv = pinEnv
  res.locals.pageTitle = 'View and print PINs'
  req.breadcrumbs(
    isLiveCheck ? 'Generate school passwords and PINs for the official check' : 'Generate passwords and PINs for the try it out check',
    `/pupil-pin/generate-${pinEnv}-pins-overview`)
  req.breadcrumbs(res.locals.pageTitle)

  const helplineNumber = config.Data.helplineNumber
  let pupils
  let pupilsPresentationData
  let groups
  let school
  let error
  let qrDataURL
  let date = dateService.formatPinDate(moment()) // default to today (but formatted)
  let checkWindowData
  try {
    checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
    const availabilityData = await businessAvailabilityService.getAvailabilityData(req.user.schoolId, checkWindowData, req.user.timezone)
    if (!availabilityData[`${pinEnv}PinsAvailable`]) {
      return res.render('availability/section-unavailable', {
        title: res.locals.pageTitle,
        breadcrumbs: req.breadcrumbs()
      })
    }
    pupils = await pinGenerationV2Service.getPupilsWithActivePins(req.user.schoolId, isLiveCheck)
    if (Array.isArray(pupils) && pupils.length > 0) {
      // Format the pin expiry date as "Wednesday 13 March" in wall clock time for all schools, including MOD.
      const defaultTimezone = 'Europe/London'
      const tz = req.user.timezone ?? defaultTimezone
      date = dateService.formatPinDate(pupils[0]?.pinExpiresAt ?? moment(), tz)
    }
    school = await pinService.getActiveSchool(req.user.School, req.user.role)
    error = await checkWindowSanityCheckService.check(isLiveCheck)
    if (Array.isArray(pupils) && pupils.length > 0) {
      groups = await groupService.findGroupsByPupil(req.user.schoolId, pupils)
      pupilsPresentationData = pupilPinPresenter.getPupilPinViewData(await groupService.assignGroupsToPupils(req.user.schoolId, pupils))
    }
    qrDataURL = await qrService.getDataURL(`${config.PUPIL_APP_URL}${config.Data.QrCodePupilAppPath}`)
  } catch (error) {
    return next(error)
  }
  const defaultTimezone = 'Europe/London'
  return res.render('pupil-pin/view-and-custom-print-pins', {
    breadcrumbs: req.breadcrumbs(),
    school,
    pupils: pupilsPresentationData,
    groups,
    date,
    error,
    helplineNumber,
    qrDataURL,
    url: config.PUPIL_APP_URL,
    tz: req.user.timezone ?? defaultTimezone
  })
}

const getSelectOfficialOrTryItOutPinGen = async function getSelectOfficialOrTryItOutPinGenFunc (req, res) {
  res.locals.pageTitle = 'Generate and view school password and PINs for the try it out and official check'
  req.breadcrumbs(res.locals.pageTitle)

  const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
  const featureEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData, req.user.timezone)
  const slots = {
    officialPinGenSlot: await pupilPinPresentationService.getOfficialPinGenSlot(featureEligibilityData),
    tryItOutPinGenSlot: await pupilPinPresentationService.getTryItOutPinGenSlot(featureEligibilityData)
  }

  return res.render('pupil-pin/select-official-or-try-it-out-pins', {
    breadcrumbs: req.breadcrumbs(),
    slots
  })
}

module.exports = {
  getGeneratePinsOverview,
  postGeneratePins,
  getGeneratePinsList,
  getViewAndCustomPrintPins,
  getSelectOfficialOrTryItOutPinGen
}
