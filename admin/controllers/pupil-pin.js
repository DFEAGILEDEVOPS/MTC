const R = require('ramda')
const config = require('../config')
const schoolDataService = require('../services/data-access/school.data.service')
const pinService = require('../services/pin.service')
const sortingAttributesService = require('../services/sorting-attributes.service')
const pinGenerationService = require('../services/pin-generation.service')
const groupService = require('../services/group.service')
const dateService = require('../services/date.service')
const qrService = require('../services/qr.service')
const checkStartService = require('../services/check-start.service')

const getGeneratePinsOverview = async (req, res, next) => {
  res.locals.pageTitle = 'Generate pupil PINs'
  req.breadcrumbs(res.locals.pageTitle)
  let pupils
  try {
    pupils = await pinService.getPupilsWithActivePins(req.user.School)
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
  let pupils
  let groups = []
  let groupIds = req.params.groupIds || ''

  const sortingOptions = [ { 'key': 'lastName', 'value': 'asc' } ]
  let sortField = req.params.sortField === undefined ? 'lastName' : req.params.sortField
  const sortDirection = req.params.sortDirection === undefined ? 'asc' : req.params.sortDirection
  const { htmlSortDirection, arrowSortDirection } = sortingAttributesService.getAttributes(sortingOptions, sortField, sortDirection)

  // TODO: data service call should be moved to a service
  try {
    school = await schoolDataService.sqlFindOneByDfeNumber(req.user.School)
    if (!school) {
      return next(Error(`School [${req.user.school}] not found`))
    }
    pupils = await pinGenerationService.getPupils(school.dfeNumber, sortField, sortDirection)
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
    groupIds,
    htmlSortDirection,
    arrowSortDirection
  })
}

const postGeneratePins = async (req, res, next) => {
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
    return res.redirect('/pupil-pin/generate-pins-list')
  }
  let school
  try {
    await checkStartService.prepareCheck(pupilsList, req.user.School)
    school = await schoolDataService.sqlFindOneByDfeNumber(req.user.School)
    if (!school) {
      return next(Error(`School [${req.user.school}] not found`))
    }
    const update = pinGenerationService.generateSchoolPassword(school)
    if (update) {
      await schoolDataService.sqlUpdate(R.assoc('id', school.id, update))
    }
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
    pupils = await pinService.getPupilsWithActivePins(req.user.School)
    school = await pinService.getActiveSchool(req.user.School)
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

/**
 * Get Print PINs.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const getPrintPins = async (req, res, next) => {
  res.locals.pageTitle = 'Print pupils'
  let groups
  let pupils
  let school
  let qrDataURL
  const date = dateService.formatDayAndDate(new Date())
  try {
    groups = await groupService.getGroupsAsArray(req.user.schoolId)
    pupils = await pinService.getPupilsWithActivePins(req.user.School)
    if (pupils.length > 0 && groups.length > 0) {
      pupils = pupils.map(p => {
        p.group = groups[p.group_id] || ''
        return p
      })
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
  getGeneratedPinsList,
  getPrintPins
}
