'use strict'

const helpdeskService = require('../services/helpdesk.service')
const schoolHomePageService = require('../services/school-home-page/school-home-page.service')
const controller = {}

/**
 * Display school landing page.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
controller.getSchoolLandingPage = async function getSchoolLandingPage (req, res, next) {
  res.locals.pageTitle = 'School Homepage'
  try {
    const isHelpdeskRole = helpdeskService.isHelpdeskRole(req.user)
    const isStaAdmin = helpdeskService.isStaAdmin(req.user)
    const isImpersonating = helpdeskService.isImpersonating(req.user)
    // Prevent helpdesk/staAdmin users from accessing school home when impersonation data is not populated
    if ((isHelpdeskRole || isStaAdmin) && !isImpersonating) {
      return res.redirect('/helpdesk/school-impersonation')
    }

    /**
     *
     * @type {{tryItOutPinGenSlot: *, resultsSlot: string, groupsLinkSlot: *, featureEligibilityData: {}, isResultsFeatureAccessible: *, hdfSlot: *, serviceMessage: *, schoolName: string, restartPupilSlot: *, officialPinGenSlot: *}}
     */
    const content = await schoolHomePageService.getContent(req.user)

    return res.render('school/school-home', {
      breadcrumbs: [{ name: 'School Home' }],
      featureEligibilityData: content.featureEligibilityData,
      isResultsFeatureAccessible: content.isResultsFeatureAccessible,
      schoolName: content.schoolName,
      serviceMessage: content.serviceMessage,
      groupsLinkSlot: content.groupsLinkSlot,
      tryItOutPinGenSlot: content.tryItOutPinGenSlot,
      officialPinGenSlot: content.officialPinGenSlot,
      restartPupilSlot: content.restartPupilSlot,
      hdfSlot: content.hdfSlot,
      resultsSlot: content.resultsSlot
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = controller
