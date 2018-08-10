'use strict'

const groupService = require('../services/group.service')
const groupDataService = require('../services/data-access/group.data.service')
const groupValidator = require('../lib/validator/group-validator')
const monitor = require('../helpers/monitor')

/**
 * Render the initial 'groups' page.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
const groupPupilsPage = async (req, res, next) => {
  res.locals.pageTitle = 'Group pupils'

  let groups
  let pupilsPerGroup

  try {
    groups = await groupService.getGroups(req.user.schoolId)
  } catch (error) {
    next(error)
  }

  req.breadcrumbs(res.locals.pageTitle)
  res.render('groups/groups.ejs', {
    breadcrumbs: req.breadcrumbs(),
    pupilsPerGroup,
    groups
  })
}

/**
 * Render add/edit pages.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
const manageGroupPage = async (req, res, next) => {
  let pupilsList
  let selectedPupils = []
  let group
  let action = 'add'
  res.locals.pageTitle = 'Create group'

  if (req.params.groupId) {
    action = 'edit'
    res.locals.pageTitle = 'Edit group'
    try {
      group = await groupService.getGroupById(req.params.groupId, req.user.schoolId)
    } catch (error) {
      return next(error)
    }
  }

  try {
    pupilsList = await groupService.getPupils(req.user.schoolId, req.params.groupId)
    pupilsList.map((p) => { selectedPupils[p.id] = !!p.group_id })
  } catch (error) {
    return next(error)
  }

  req.breadcrumbs('Group pupils', '/group/pupils-list')
  req.breadcrumbs(res.locals.pageTitle)
  res.render('groups/manage-group.ejs', {
    breadcrumbs: req.breadcrumbs(),
    actionTitle: res.locals.pageTitle,
    action,
    group,
    selectedPupils,
    pupilsList
  })
}

/**
 * Add group.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const addGroup = async (req, res, next) => {
  if (!req.body.name || !req.body.pupil) {
    req.flash('error', 'Missing fields.')
    return res.redirect('/group/pupils-list/add')
  }

  let validationError
  let group = {
    name: req.body.name,
    pupils: req.body.pupil
  }

  try {
    validationError = await groupValidator.validate(req.body, '', req.user.schoolId)
  } catch (error) {
    next(error)
  }

  if (validationError.hasError()) {
    let pupilsList
    let selectedPupils = []
    let selectedPupilsIds = Object.values(req.body.pupil)

    try {
      pupilsList = await groupService.getPupils(req.user.schoolId)
    } catch (error) {
      next(error)
    }

    selectedPupilsIds.map((s) => { selectedPupils[s] = true })

    req.body.pupils = req.body.pupil
    req.breadcrumbs('Group pupils', '/group/pupils-list')
    res.locals.pageTitle = 'Create group'
    req.breadcrumbs(res.locals.pageTitle)

    return res.render('groups/manage-group.ejs', {
      breadcrumbs: req.breadcrumbs(),
      actionTitle: res.locals.pageTitle,
      action: 'add',
      group: req.body,
      validation: validationError.errors,
      pupilsList,
      selectedPupils
    })
  }
  let groupId
  try {
    groupId = await groupService.create(group.name, group.pupils, req.user.schoolId)
  } catch (error) {
    return next(error)
  }

  req.flash('info', 'New group created')
  // TODO technical debt - do not use req.flash to pass data
  req.flash('groupId', groupId)
  return res.redirect('/group/pupils-list')
}

/**
 * Edit group.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const editGroup = async (req, res, next) => {
  if (!req.body.name || !req.body.pupil || !req.body.groupId) {
    req.flash('error', 'Missing fields.')
    return res.redirect('/group/pupils-list/edit')
  }

  let group
  let oldGroup

  try {
    oldGroup = await groupService.getGroupById(req.body.groupId, req.user.schoolId)
  } catch (error) {
    return next(error)
  }

  group = {
    name: req.body.name,
    pupils: req.body.pupil,
    id: req.body.groupId,
    isDeleted: false
  }

  const validationError = await groupValidator.validate(req.body, oldGroup.name, req.user.schoolId)
  if (validationError.hasError()) {
    let pupilsList
    let selectedPupils = []
    let selectedPupilIds

    try {
      pupilsList = await groupService.getPupils(req.user.schoolId, req.body.groupId)
    } catch (error) {
      return next(error)
    }

    selectedPupilIds = Object.values(req.body.pupil)
    selectedPupilIds.map((p) => { selectedPupils[p] = true })

    req.breadcrumbs('Group pupils', '/group/pupils-list')
    res.locals.pageTitle = 'Edit group'
    req.breadcrumbs(res.locals.pageTitle)

    return res.render('groups/manage-group.ejs', {
      breadcrumbs: req.breadcrumbs(),
      actionTitle: res.locals.pageTitle,
      action: 'edit',
      group,
      validation: validationError.errors,
      pupilsList,
      selectedPupils
    })
  }

  try {
    await groupService.update(req.body.groupId, group, req.user.schoolId)
  } catch (error) {
    return next(error)
  }

  req.flash('info', `Changes made to '${req.body.name}'`)
  req.flash('groupId', encodeURIComponent(req.body.groupId))
  return res.redirect('/group/pupils-list')
}

const removeGroup = async (req, res, next) => {
  if (!req.params.groupId) {
    req.flash('error', 'Missing group id.')
    return res.redirect('/group/pupils-list')
  }

  try {
    await groupDataService.sqlMarkGroupAsDeleted(req.params.groupId)
  } catch (error) {
    return next(error)
  }

  req.flash('deleted', 'Group deleted')
  return res.redirect('/group/pupils-list')
}

module.exports = monitor('group.controller', {
  groupPupilsPage,
  manageGroupPage,
  addGroup,
  editGroup,
  removeGroup
})
