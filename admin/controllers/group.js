'use strict'

const groupService = require('../services/group.service')
const groupValidator = require('../lib/validator/group-validator')

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

  try {
    groups = await groupService.getGroups()
  } catch (error) {
    next(error)
  }

  req.breadcrumbs(res.locals.pageTitle)
  res.render('groups/groups.ejs', {
    breadcrumbs: req.breadcrumbs(),
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
  let group
  let action = 'Add'

  if (req.params.groupId) {
    try {
      group = await groupService.getGroupById(req.params.groupId)
    } catch (error) {
      return next(error)
    }
    action = 'Edit'
  }

  try {
    pupilsList = await groupService.getPupils(req.user.schoolId, req.params.groupId)
  } catch (error) {
    return next(error)
  }

  res.locals.pageTitle = `${action} group`
  req.breadcrumbs('Group pupils', '/school/group-pupils')
  req.breadcrumbs(res.locals.pageTitle)
  res.render('groups/manage-group.ejs', {
    breadcrumbs: req.breadcrumbs(),
    action,
    group,
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
    return res.redirect('/school/group-pupils/add')
  }

  let validationError
  let group = {
    name: req.body.name,
    pupils: req.body.pupil
  }

  // @TODO: To be reviewed/refactored
  // try {
  //   validationError = await groupValidator.validate(req.body)
  // } catch (error) {
  //   next(error)
  // }

  // if (validationError.hasError()) {
  //   let pupilsList
  //
  //   try {
  //     pupilsList = await groupService.getPupils(req.user.schoolId, req.params.groupId)
  //   } catch (error) {
  //     next(error)
  //   }
  //
  //   req.body.pupils = req.body.pupil
  //   req.breadcrumbs('Group pupils', '/school/group-pupils')
  //   res.locals.pageTitle = 'Add group'
  //   req.breadcrumbs(res.locals.pageTitle)
  //
  //   return res.render('groups/manage-group.ejs', {
  //     breadcrumbs: req.breadcrumbs(),
  //     action: 'Add',
  //     group: req.body,
  //     validation: validationError.errors,
  //     pupilsList: pupilsList
  //   })
  // }

  try {
    // @TODO: TO BE DELETED
    // group = await groupDataService.create(group)
    group = await groupService.create({'name': group.name}, group.pupils)
  } catch (error) {
    return next(error)
  }

  req.flash('info', 'New group created')
  req.flash('groupId', group._id)
  return res.redirect('/school/group-pupils')
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
    return res.redirect('/school/group-pupils/edit')
  }

  let group
  let oldGroup

  try {
    oldGroup = await groupService.getGroupById(req.body.groupId)
  } catch (error) {
    return next(error)
  }

  group = {
    name: req.body.name,
    pupils: req.body.pupil,
    _id: req.body.groupId,
    isDeleted: false
  }


  // @TODO: To be reviewed/refactored
  const validationError = await groupValidator.validate(req.body, oldGroup.name)
  if (validationError.hasError()) {
    let pupilsList

    try {
      pupilsList = await groupService.getPupils(req.user.schoolId, req.body.groupId)
    } catch (error) {
      return next(error)
    }

    req.breadcrumbs('Group pupils', '/school/group-pupils')
    res.locals.pageTitle = 'Edit group'
    req.breadcrumbs(res.locals.pageTitle)

    return res.render('groups/manage-group.ejs', {
      breadcrumbs: req.breadcrumbs(),
      action: 'Edit',
      group,
      validation: validationError.errors,
      pupilsList
    })
  }

  try {
    group = await groupService.updateGroup(req.body.groupId, group)
  } catch (error) {
    return next(error)
  }

  req.flash('info', `Changes made to '${req.body.name}'`)
  req.flash('groupId', group._id)
  return res.redirect('/school/group-pupils')
}

const removeGroup = async (req, res, next) => {
  if (!req.params.groupId) {
    req.flash('error', 'Missing group id.')
    return res.redirect('/school/group-pupils')
  }

  try {
    await groupDataService.delete(req.params.groupId)
  } catch (error) {
    return next(error)
  }

  req.flash('deleted', 'Group deleted')
  return res.redirect('/school/group-pupils')
}

module.exports = {
  groupPupilsPage,
  manageGroupPage,
  addGroup,
  editGroup,
  removeGroup
}
