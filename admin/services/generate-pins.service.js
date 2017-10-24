const pupilDataService = require('../services/data-access/pupil.data.service')

const generatePinService = {
  /**
   * Fetch pupils and filter required only pupil attributes
   * @param schoolId
   * @returns {Promise.<*>}
   */
  getPupils: async (schoolId) => {
    let { pupils } = await pupilDataService.getPupils(schoolId)
    pupils = pupils
      .filter(p => !p.pin && !p.attendanceCode && !p.result)
      .map(({_id, pin, foreName, middleNames, lastName}) => ({ _id, pin, foreName, middleNames, lastName }))
      .sort((a, b) => a.lastName.localeCompare(b.lastName))
    return pupils
  }
}

module.exports = generatePinService
