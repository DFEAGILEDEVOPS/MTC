const moment = require('moment')
const pupilService = require('../services/pupil.service')

const generatePinService = {
  /**
   * Fetch pupils and filter required only pupil attributes
   * @param schoolId
   * @param sortField
   * @param sortDirection
   * @returns {Array}
   */
  getPupils: async (schoolId, sortField, sortDirection) => {
    let pupils = await pupilService.fetchSortedPupilsData(schoolId, sortField, sortDirection)
    pupils = pupils
      .filter(p => !p.pin && !p.attendanceCode && !p.result)
      .map(({_id, pin, dob, foreName, middleNames, lastName}) => ({ _id, pin, dob: moment(dob).format('DD MMM YYYY'), foreName, middleNames, lastName }))
    return pupils
  }
}

module.exports = generatePinService
