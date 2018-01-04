const groupService = require('../services/group.service')
const groupDataService = require('../services/data-access/group.data.service')
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
    groups = await groupService.getGroups({})
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
    pupilsList = await groupService.getPupils(req.user.School, req.params.groupId)
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

  let group = {
    name: req.body.name,
    pupils: req.body.pupil
  }

  const validationError = await groupValidator.validate(req.body)
  if (validationError.hasError()) {
    let pupilsList

    try {
      pupilsList = await groupService.getPupils(req.user.School)
    } catch (error) {
      next(error)
    }

    res.locals.pageTitle = 'Add group'
    req.breadcrumbs(res.locals.pageTitle)

    return res.render('groups/manage-group.ejs', {
      breadcrumbs: req.breadcrumbs(),
      action: 'Add',
      group,
      validation: validationError.errors,
      pupilsList
    })
  }

  try {
    group = await groupDataService.create(group)
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

  try {
    group = await groupService.getGroupById(req.body.groupId)
  } catch (error) {
    return next(error)
  }

  const validationError = await groupValidator.validate(req.body, group.name)
  if (validationError.hasError()) {
    let pupilsList

    try {
      pupilsList = await groupService.getPupils(req.user.School)
    } catch (error) {
      return next(error)
    }

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

  group.name = req.body.name
  group.pupils = req.body.pupil

  try {
    group = await groupDataService.update(req.body.groupId, group)
  } catch (error) {
    return next(error)
  }

  req.flash('info', `Changes made to '${req.body.name}'`)
  req.flash('groupId', group._id)
  return res.redirect('/school/group-pupils')
}

module.exports = {
  groupPupilsPage,
  manageGroupPage,
  addGroup,
  editGroup
}
