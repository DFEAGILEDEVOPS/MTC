'use strict'

const accessArrangementsOverviewPresenter = {}

/**
 * Return list of pupils with appropriate styling properties
 * @param {Array} pupils
 * @param {Array} hl
 * @param {Object} availabilityData
 * @returns {Array} pupil data
 */
accessArrangementsOverviewPresenter.getPresentationData = (pupils, availabilityData, hl) => {
  return pupils.map(pupil => {
    if (hl && hl.includes(pupil.urlSlug)) {
      let arrangementsLn = pupil.arrangements.length
      if (pupil.showDoB && arrangementsLn === 1) {
        arrangementsLn = 2
      }
      pupil.verticalBarStyle = arrangementsLn > 1 ? `height:${235 - 35 * (7 - arrangementsLn)}px` : `height:0px`
    }
    pupil.hasAAEditDisabled = !availabilityData.canEditArrangements || pupil.hasCompletedCheck || pupil.notTakingCheck
    return pupil
  })
}

module.exports = accessArrangementsOverviewPresenter
