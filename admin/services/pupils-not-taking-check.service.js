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
  },
  /**
   * Fetch list of pupils that have reasons.
   * @param attendanceCodes
   * @param pupils
   * @param highlight
   * @returns {Promise.<Promise.<T>|Promise|Promise<any>|*>}
   */
  formatPupilsWithReasons: async (attendanceCodes, pupils, highlight) => {
    return Promise.all(pupils.map(async (p) => {
      p.reason = 'N/A'
      p.highlight = false
      if (p.attendanceCode !== undefined && p.attendanceCode._id !== undefined) {
        let accCode = attendanceCodes.filter(ac => JSON.stringify(ac._id) === JSON.stringify(p.attendanceCode._id))
        if (accCode.length > 0) {
          p.reason = accCode[0].reason
        }
        if (highlight) {
          p.highlight = (highlight.filter(pp => JSON.stringify(pp) === JSON.stringify(p._id))).length > 0
        }
      }
      return p
    })).catch((error) => {
      throw new Error(error)
    })
  }
}

module.exports = pupilsNotTakingCheckService
