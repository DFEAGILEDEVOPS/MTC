'use strict'
const ejsUtil = require('../lib/ejs-util')

const accessArrangementsOverviewPresenter = {
  /**
   * Return list of pupils with appropriate styling properties
   * @param {Array} pupils
   * @param {Array} hl
   * @param {Object} availabilityData
   * @returns {Array} pupil data
   */
  getPresentationData: function getPresentationData (pupils, availabilityData, hl) {
    return pupils.map(pupil => {
      if (hl && hl.includes(pupil.urlSlug)) {
        let arrangementsLn = pupil.arrangements.length
        if (pupil.showDoB && arrangementsLn === 1) {
          arrangementsLn = 2
        }
        pupil.verticalBarStyle = arrangementsLn > 1 ? `height:${235 - 35 * (7 - arrangementsLn)}px` : 'height:0px'
      }
      pupil.hasAAEditDisabled = !availabilityData.canEditArrangements || pupil.hasCompletedCheck || pupil.notTakingCheck
      return pupil
    })
  },

  /**
   * The retro input assistant text gives the user a link to retrospectively apply an access arrangment to a check.
   * As this only applies to live checks, we only want to show it when the check is active.
   * @param availabilityData
   * @return {Promise<string>}
   */
  getRetroInputAssistantText: async function getRetroInputAssistantText (availabilityData) {
    let html = ''
    if (!availabilityData.hdfSubmitted && availabilityData.checkWindowStarted) {
      html = await ejsUtil.render('access-arrangements/retro-input-assistant')
    }
    return html
  }
}

module.exports = accessArrangementsOverviewPresenter
