'use strict'

const sortingAttributesService = require('../services/sorting-attributes.service')
const groupService = require('../services/group.service')
const pupilService = require('../services/pupil.service')
const pupilRegisterService = require('../services/pupil-register.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const pupilIdentificationFlag = require('../services/pupil-identification-flag.service')
const pupilStatusService = require('../services/pupil.status.service')

const pupilList = async (req, res, next) => {
  res.locals.pageTitle = 'Pupil register'

  // Sorting
  const sortingOptions = [
    { 'key': 'name', 'value': 'asc' },
    { 'key': 'status', 'value': 'asc' },
    { 'key': 'group', 'value': 'asc' }
  ]
  const sortField = req.params.sortField === undefined ? 'name' : req.params.sortField
  const sortDirection = req.params.sortDirection === undefined ? 'asc' : req.params.sortDirection
  const { htmlSortDirection, arrowSortDirection } = sortingAttributesService.getAttributes(sortingOptions, sortField, sortDirection)

  let pupilsFormatted = []

  try {
    pupilsFormatted = pupilRegisterService.findPupils(req.user.School, req.user.schoolId, sortDirection)
    // groupsIndex = await groupService.getGroupsAsArray(req.user.schoolId)
    // const pupils = await pupilDataService.sqlFindPupilsByDfeNumber(req.user.School, sortDirection)
    //
    // pupilsFormatted = await Promise.all(pupils.map(async (p, i) => {
    //   const { foreName, lastName, middleNames, dateOfBirth, urlSlug } = p
    //   const outcome = await pupilStatusService.getStatus(p)
    //   const group = groupsIndex[p.group_id] || '-'
    //   return {
    //     urlSlug,
    //     foreName,
    //     lastName,
    //     middleNames,
    //     dateOfBirth,
    //     group,
    //     outcome
    //   }
    // })).catch((error) => next(error))
  } catch (error) {
    next(error)
  }

  pupilIdentificationFlag.addIdentificationFlags(pupilsFormatted)

  // If sorting by 'status', use custom method.
  if (sortField === 'status') {
    pupilsFormatted = pupilService.sortByStatus(pupilsFormatted, sortDirection)
  }

  // If sorting by 'group', use custom method.
  if (sortField === 'group') {
    pupilsFormatted = pupilService.sortByGroup(pupilsFormatted, sortDirection)
  }

  req.breadcrumbs(res.locals.pageTitle)
  let { hl } = req.query
  if (hl) {
    hl = JSON.parse(hl)
    hl = typeof hl === 'string' ? JSON.parse(hl) : hl
  }

  res.render('school/pupil-register', {
    highlight: hl && new Set(hl),
    pupils: pupilsFormatted,
    breadcrumbs: req.breadcrumbs(),
    htmlSortDirection,
    arrowSortDirection
  })
}

module.exports = { pupilList }
