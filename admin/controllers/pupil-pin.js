const config = require('../config')
const schoolDataService = require('../services/data-access/school.data.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const schoolService = require('../services/school.service')
const pupilService = require('../services/pupil.service')
const sortingAttributesService = require('../services/sorting-attributes.service')
const generatePinsService = require('../services/generate-pins.service')
const dateService = require('../services/date.service')
const qrService = require('../services/qr.service')

const getGeneratePinsOverview = async (req, res, next) => {
  res.locals.pageTitle = 'Generate pupil PINs'
  req.breadcrumbs(res.locals.pageTitle)
  let pupils
  try {
    pupils = await pupilService.getPupilsWithActivePins(req.user.School)
  } catch (err) {
    return next(err)
  }
  if (pupils && pupils.length > 0) {
    return res.redirect('/pupil-pin/generated-pins-list')
  }
  return res.render('pupil-pin/generate-pins-overview', {
    breadcrumbs: req.breadcrumbs()
  })
}

const getGeneratePinsList = async (req, res, next) => {
  res.locals.pageTitle = 'Select pupils'
  req.breadcrumbs('Generate pupil PINs', '/pupil-pin/generate-pins-overview')
  req.breadcrumbs(res.locals.pageTitle)
  let school
  try {
    school = await schoolDataService.findOne({_id: req.user.School})
    if (!school) {
      return next(Error(`School [${req.user.school}] not found`))
    }
  } catch (error) {
    return next(error)
  }
  const sortingOptions = [ { 'key': 'lastName', 'value': 'asc' } ]
  let sortField = req.params.sortField === undefined ? 'lastName' : req.params.sortField
  const sortDirection = req.params.sortDirection === undefined ? 'asc' : req.params.sortDirection
  const { htmlSortDirection, arrowSortDirection } = sortingAttributesService.getAttributes(sortingOptions, sortField, sortDirection)
  const pupils = await generatePinsService.getPupils(school._id, sortField, sortDirection)
  return res.render('pupil-pin/generate-pins-list', {
    breadcrumbs: req.breadcrumbs(),
    pupils,
    htmlSortDirection,
    arrowSortDirection
  })
}

const postGeneratePins = async (req, res, next) => {
  const { pupil: pupilsList } = req.body
  if (!pupilsList) {
    return res.redirect('/pupil-pin/generate-pins-list')
  }
  let submittedPupils
  let school
  try {
    submittedPupils = await generatePinsService.generatePupilPins(pupilsList)
    await pupilDataService.updateMultiple(submittedPupils)
    school = await schoolDataService.findOne({_id: req.user.School})
    if (!school) {
      return next(Error(`School [${req.user.school}] not found`))
    }
    const { schoolPin, pinExpiresAt } = generatePinsService.generateSchoolPassword(school)
    await schoolDataService.update(school._id, {schoolPin, pinExpiresAt})
  } catch (error) {
    return next(error)
  }
  return res.redirect('/pupil-pin/generated-pins-list')
}

const getGeneratedPinsList = async (req, res, next) => {
  res.locals.pageTitle = 'Generate pupil PINs'
  req.breadcrumbs(res.locals.pageTitle)
  let pupils
  let school
  const date = dateService.formatDayAndDate(new Date())
  try {
    pupils = await pupilService.getPupilsWithActivePins(req.user.School)
    school = await schoolService.getActiveSchool(req.user.School)
  } catch (error) {
    return next(error)
  }
  return res.render('pupil-pin/generated-pins-list', {
    breadcrumbs: req.breadcrumbs(),
    school,
    pupils,
    date
  })
}

const getPrintPins = async (req, res, next) => {
  res.locals.pageTitle = 'Print pupils'
  let pupils
  let school
  let qrDataURL
  const date = dateService.formatDayAndDate(new Date())
  try {
    pupils = await pupilService.getPupilsWithActivePins(req.user.School)
    school = await schoolService.getActiveSchool(req.user.School)
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
  getGeneratedPinsList,
  getPrintPins
}
