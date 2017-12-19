const groupService = require('../services/group.service')

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

const manageGroupPage = async (req, res, next) => {
  res.locals.pageTitle = 'Manage group'

  let pupilsList
  let error

  try {
    pupilsList = await groupService.getPupils(req.user.School)
    console.log('pupilsList', pupilsList)
  } catch (error) {
    next(error)
  }

  req.breadcrumbs(res.locals.pageTitle)
  res.render('groups/manage-group.ejs', {
    breadcrumbs: req.breadcrumbs(),
    error,
    pupilsList
  })
}

module.exports = {
  groupPupilsPage,
  manageGroupPage
}
