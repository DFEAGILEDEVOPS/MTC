const ejsUtil = require('../lib/ejs-util')

const pupilPinPresentationService = {
  /**
   *
   * @param {*} featureEligibilityData - the returned object from `schoolHomeFeatureEligibilityPresenter.getPresentationData()`
   * @returns
   */
  getTryItOutPinGenSlot: async function getTryItOutPinGenSlot (featureEligibilityData) {
    let slot
    const linkDescription = 'Try it out check'
    if (featureEligibilityData.isFamiliarisationPinGenerationAllowed) {
      slot = await ejsUtil.render('partials/pupil-pin/active-button', {
        linkUrl: '/pupil-pin/generate-familiarisation-pins-overview',
        linkDescription
      })
    } else {
      let explanation = ''
      if (featureEligibilityData.isCheckWindowClosed) {
        explanation = 'Check window has closed'
      } else if (featureEligibilityData.isWithinFamiliarisationUnavailableHours) {
        explanation = 'Open 6am - 4pm'
      } else if (featureEligibilityData.isFamiliarisationInTheFuture) {
        explanation = `Open 6am - 4pm on ${featureEligibilityData.familiarisatonCheckDateRangeLabel}`
      }
      slot = await ejsUtil.render('partials/pupil-pin/inactive-button', {
        linkDescription,
        explanationText: explanation
      })
    }
    return slot
  },

  /**
   *
   * @param {*} featureEligibilityData - the returned object from `schoolHomeFeatureEligibilityPresenter.getPresentationData()`
   * @returns
   */
  getOfficialPinGenSlot: async function officialPinGenSlot (featureEligibilityData) {
    let slot
    const linkDescription = 'Official check'
    if (featureEligibilityData.isLivePinGenerationAllowed) {
      slot = await ejsUtil.render('partials/pupil-pin/active-button', {
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
      slot = await ejsUtil.render('partials/pupil-pin/inactive-button', {
        linkDescription,
        explanationText: explanation
      })
    }
    return slot
  }
}

module.exports = pupilPinPresentationService
