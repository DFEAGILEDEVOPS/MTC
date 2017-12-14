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
  groups = await groupService.getGroups({})

  try {
    req.breadcrumbs(res.locals.pageTitle)
    res.render('groups/groups.ejs', {
      breadcrumbs: req.breadcrumbs(),
      groups
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  groupPupilsPage
}
