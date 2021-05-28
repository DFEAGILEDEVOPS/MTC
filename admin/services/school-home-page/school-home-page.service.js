const moment = require('moment-timezone')

const administrationMessageService = require('../administration-message.service')
const checkWindowV2Service = require('../check-window-v2.service')
const config = require('../../config')
const ejsUtil = require('../../lib/ejs-util')
const resultsPageAvailabilityService = require('../results-page-availability.service')
const schoolHomeFeatureEligibilityPresenter = require('../../helpers/school-home-feature-eligibility-presenter')
const schoolService = require('../school.service')

const schoolHomePageService = {
  getContent: async function getSchoolHomePageContent (user) {
    // Get async base data
    const checkWindowDataPromise = checkWindowV2Service.getActiveCheckWindow(true)
    const schoolNamePromise = schoolService.findSchoolNameByDfeNumber(user.School)
    const serviceMessagePromise = await administrationMessageService.getMessage()
    const allPromises = await Promise.all([checkWindowDataPromise, schoolNamePromise, serviceMessagePromise])
    const [checkWindowData, schoolName, serviceMessage] = allPromises

    // Business logic - no data IO
    const featureEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData, user.timezone)
    const currentDate = moment.tz(user.timezone || config.DEFAULT_TIMEZONE)
    const resultsOpeningDay = resultsPageAvailabilityService.getResultsOpeningDate(currentDate, checkWindowData.checkEndDate)
    const isResultsFeatureAccessible = resultsPageAvailabilityService.isResultsFeatureAccessible(currentDate, resultsOpeningDay)

    // Determine what links are active on the home page.  The content of each link in a 'slot' which is the html
    // string to drop in place on the home-page.  This string could be a single word or a para of html.  Slots are
    // already escaped in the underlying template, so must not be escaped again.
    const groupsLinkSlot = await schoolHomePageService.getGroupsLinkSlot(featureEligibilityData)
    const tryItOutPinGenSlot = await schoolHomePageService.getTryItOutPinGenSlot(featureEligibilityData)
    const officialPinGenSlot = await schoolHomePageService.getOfficialPinGenSlot(featureEligibilityData)
    const restartPupilSlot = await schoolHomePageService.getRestartPupilSlot(featureEligibilityData)
    const hdfSlot = await schoolHomePageService.getHdfSlot(featureEligibilityData)
    const resultsSlot = await schoolHomePageService.getResultsSlot(featureEligibilityData, isResultsFeatureAccessible)
    const pupilStatusSlot = await schoolHomePageService.getPupilStatusSlot(featureEligibilityData)

    return {
      groupsLinkSlot,
      hdfSlot,
      officialPinGenSlot,
      pupilStatusSlot,
      restartPupilSlot,
      resultsSlot,
      schoolName,
      serviceMessage,
      tryItOutPinGenSlot
    }
  },

  getGroupsLinkSlot: async function getGroupsLinksSlot (featureEligibilityData) {
    let slot
    const linkDescription = 'Organise pupils into groups'
    if (!featureEligibilityData.isCheckWindowClosed) {
      slot = await ejsUtil.render('partials/school/home-page/active-link', {
        linkUrl: '/group/pupils-list',
        linkDescription
      })
    } else {
      slot = await ejsUtil.render('partials/school/home-page/inactive-link', {
        linkDescription,
        showUnavailableLabel: true,
        showUnavailableLabelText: 'Check window has closed'
      })
    }
    return slot
  },

  getTryItOutPinGenSlot: async function getTryItOutPinGenSlot (featureEligibilityData) {
    let slot
    const linkDescription = 'Generate passwords and PINs for the try it out check'
    if (featureEligibilityData.isFamiliarisationPinGenerationAllowed) {
      slot = await ejsUtil.render('partials/school/home-page/active-link', {
        linkUrl: '/pupil-pin/generate-familiarisation-pins-overview',
        linkDescription
      })
    } else {
      let explanation = ''
      if (featureEligibilityData.isCheckWindowClosed) { explanation = 'Check window has closed' }
      if (featureEligibilityData.isWithinFamiliarisationUnavailableHours) { explanation = 'Open 6am - 4pm' }
      slot = await ejsUtil.render('partials/school/home-page/inactive-link', {
        linkDescription,
        showUnavailableLabel: true,
        showUnavailableLabelText: explanation
      })
    }
    return slot
  },

  getOfficialPinGenSlot: async function officialPinGenSlot (featureEligibilityData) {
    let slot
    const linkDescription = 'Generate passwords and PINs for the official check'
    if (featureEligibilityData.isLivePinGenerationAllowed) {
      slot = await ejsUtil.render('partials/school/home-page/active-link', {
        linkUrl: '/pupil-pin/generate-live-pins-overview',
        linkDescription
      })
    } else {
      let explanation = ''
      if (featureEligibilityData.isCheckWindowClosed) {
        explanation = 'Check window has closed'
      } else if (featureEligibilityData.isWithinLiveUnavailableHours) {
        explanation = 'Open 6am - 4pm'
      } else if (featureEligibilityData.isLiveInTheFuture) {
        explanation = `Open 6am - 4pm on ${featureEligibilityData.liveCheckDateRangeLabel}`
      }
      slot = await ejsUtil.render('partials/school/home-page/inactive-link', {
        linkDescription,
        showUnavailableLabel: true,
        showUnavailableLabelText: explanation
      })
    }
    return slot
  },

  getRestartPupilSlot: async function getRestartPupilSlot (featureEligibilityData) {
    let slot
    const linkDescription = 'Select pupils to restart the check'
    if (featureEligibilityData.isRestartsPageAccessible) {
      const link = '/restart/overview'
      slot = await ejsUtil.render('partials/school/home-page/active-link', {
        linkUrl: link,
        linkDescription
      })
    } else {
      let explanation = ''
      if (featureEligibilityData.isCheckWindowClosed) {
        explanation = 'Check window has closed'
      } else if (featureEligibilityData.isLiveInTheFuture) {
        explanation = `Open ${featureEligibilityData.liveCheckDateRangeLabel}`
      }
      slot = await ejsUtil.render('partials/school/home-page/inactive-link', {
        linkDescription,
        showUnavailableLabel: true,
        showUnavailableLabelText: explanation
      })
    }
    return slot
  },

  getHdfSlot: async function getHdfSlot (featureEligibilityData) {
    let slot
    const linkDescription = 'Complete the headteacher’s declaration form'
    if (featureEligibilityData.isHdfPageAccessible) {
      const link = '/attendance/declaration-form'
      slot = await ejsUtil.render('partials/school/home-page/active-link', {
        linkUrl: link,
        linkDescription
      })
    } else {
      let explanation = ''
      if (featureEligibilityData.isLiveInTheFuture) {
        explanation = `Open ${featureEligibilityData.liveCheckStartDate}`
      }
      slot = await ejsUtil.render('partials/school/home-page/inactive-link', {
        linkDescription,
        showUnavailableLabel: true,
        showUnavailableLabelText: explanation
      })
    }
    return slot
  },

  /**
   *
   * @param featureEligibilityData
   * @param {boolean} isResultsFeatureAccessible
   * @return {Promise<string>}
   */
  getResultsSlot: async function getResultsSlot (featureEligibilityData, isResultsFeatureAccessible) {
    let slot
    const linkDescription = 'View pupil results'
    if (isResultsFeatureAccessible) {
      const link = '/results/view-results'
      slot = await ejsUtil.render('partials/school/home-page/active-link', {
        linkUrl: link,
        linkDescription
      })
    } else {
      let explanation = ''
      if (featureEligibilityData.resultsPublishedDate) {
        explanation = `Results available ${featureEligibilityData.resultsPublishedDate}`
      }
      slot = await ejsUtil.render('partials/school/home-page/inactive-link', {
        linkDescription,
        showUnavailableLabel: true,
        showUnavailableLabelText: explanation
      })
    }
    return slot
  },

  getPupilStatusSlot: async function getPupilStatusSlot (featureEligibilityData) {
    let slot
    const linkDescription = 'See how many of your pupils have completed the official check'
    if (featureEligibilityData.isHdfPageAccessible) {
      const link = '/pupil-status'
      slot = await ejsUtil.render('partials/school/home-page/active-link', {
        linkUrl: link,
        linkDescription
      })
    } else {
      let explanation = ''
      if (featureEligibilityData.resultsPublishedDate) {
        explanation = `Open ${featureEligibilityData.liveCheckDateRangeLabel}`
      }
      slot = await ejsUtil.render('partials/school/home-page/inactive-link', {
        linkDescription,
        showUnavailableLabel: true,
        showUnavailableLabelText: explanation
      })
    }
    return slot
  }
}

module.exports = schoolHomePageService
