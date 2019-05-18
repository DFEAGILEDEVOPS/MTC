const resultPageAvailabilityService = {}

/**
 * Determine if results feature is accessible from school home page
 * @param currentDate
 * @param checkWindowData
 * @returns {Boolean}
 */

resultPageAvailabilityService.isResultsFeatureAccessible = (currentDate, checkWindowData) => {
  const resultsAvailabilityDate = checkWindowData.checkEndDate.clone()
    .add(1, 'weeks').isoWeekday('Monday')
    .utcOffset(currentDate.utcOffset(), true)
    .set({ hour: 8, minutes: 0, seconds: 0 })
  return currentDate.isSameOrAfter(resultsAvailabilityDate)
}

/**
 * Determine if results page can be accessed when hdf submission is incomplete
 * @param currentDate
 * @param checkWindowData
 * @param isHdfSubmitted
 * @returns {Boolean}
 */

resultPageAvailabilityService.isResultsPageAccessibleForIncompleteHdfs = (currentDate, checkWindowData, isHdfSubmitted = false) => {
  const resultsAvailabilityDateForSubmittedHdfs = checkWindowData.checkEndDate.clone()
    .add(2, 'weeks').isoWeekday('Monday')
    .utcOffset(currentDate.utcOffset(), true)
    .set({ hour: 8, minutes: 0, seconds: 0 })
  return currentDate.isSameOrAfter(resultsAvailabilityDateForSubmittedHdfs) && !isHdfSubmitted
}

module.exports = resultPageAvailabilityService
