'use strict'

const pupilIdentificationFlag = require('../services/pupil-identification-flag.service')
const pupilRegisterService = require('../services/pupil-register.service')
const monitor = require('../helpers/monitor')

const listPupils = async (req, res, next) => {
  res.locals.pageTitle = 'Pupil register'
  const sortField = req.params.sortField === undefined ? 'name' : req.params.sortField
  const sortDirection = req.params.sortDirection === undefined ? 'asc' : req.params.sortDirection

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
    breadcrumbs: req.breadcrumbs()
  })
}

module.exports = monitor('pupil-register.controller', { listPupils })
