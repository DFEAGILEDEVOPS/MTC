const groupService = require('../services/group.service')
const groupDataService = require('../services/data-access/group.data.service')

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
  res.locals.pageTitle = 'Manage group'

  let pupilsList
  let error
  let group

  try {
    pupilsList = await groupService.getPupils(req.user.School)
  } catch (error) {
    next(error)
  }

  if (req.params.groupId) {
    try {
      group = await groupService.getGroup(req.params.groupId)
      console.log('GROUP', group)
    } catch (error) {
      return next(error)
    }
  }

  req.breadcrumbs(res.locals.pageTitle)
  res.render('groups/manage-group.ejs', {
    breadcrumbs: req.breadcrumbs(),
    group,
    error,
    pupilsList
  })
}

const saveGroup = async (req, res, next) => {
  if (!req.body.name || !req.body.pupil) {
    req.flash('error', 'Missing fields.')
    return res.redirect('/school/group-pupils/' + req.body.groupId ? `edit/${req.body.groupId}` : 'add')
  }

  let group

  if (req.body.groupId) {
    try {
      group = await groupService.getGroup(req.body.groupId)
    } catch (error) {
      return next(error)
    }
  }

  group = {
    name: req.body.name,
    pupils: req.body.pupil
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

module.exports = {
  groupPupilsPage,
  manageGroupPage,
  saveGroup
}
