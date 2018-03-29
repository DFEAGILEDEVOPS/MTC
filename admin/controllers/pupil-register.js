'use strict'

const pupilIdentificationFlag = require('../services/pupil-identification-flag.service')
const sortingAttributesService = require('../services/sorting-attributes.service')
const pupilRegisterService = require('../services/pupil-register.service')

const listPupils = async (req, res, next) => {
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
    pupilsFormatted = await pupilRegisterService.getPupils(req.user.School, req.user.schoolId, sortDirection)
    pupilIdentificationFlag.addIdentificationFlags(pupilsFormatted)
    pupilRegisterService.sortPupils(pupilsFormatted, sortField, sortDirection)
  } catch (error) {
    next(error)
  }

  req.breadcrumbs(res.locals.pageTitle)
  let { hl } = req.query
  if (hl) {
    hl = JSON.parse(hl)
    hl = typeof hl === 'string' ? JSON.parse(hl) : hl
  }

  res.render('pupil-register/pupils-list', {
    highlight: hl && new Set(hl),
    pupils: pupilsFormatted,
    breadcrumbs: req.breadcrumbs(),
    htmlSortDirection,
    arrowSortDirection
  })
}

module.exports = { listPupils }
