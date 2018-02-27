/** @namespace */

const pupilsNotTakingCheckService = {

  /**
   * Sort columns by reason asc/desc.
   * @param pupilsList
   * @param sortDirection
   * @returns {*}
   */
  sortPupilsByReason: (pupilsList, sortDirection) => {
    let sortedPupilsList
    sortedPupilsList = pupilsList.sort((a, b) => {
      if (a.reason === 'N/A') {
        return 1
      } else if (b.reason === 'N/A') {
        return -1
      } else if (a.reason === b.reason) {
        return 0
      } else if (sortDirection === 'asc') {
        return a.reason < b.reason ? -1 : 1
      } else {
        return a.reason < b.reason ? 1 : -1
      }
    })
    return sortedPupilsList
  }
}

module.exports = pupilsNotTakingCheckService
