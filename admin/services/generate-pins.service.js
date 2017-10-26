const moment = require('moment')
const pupilDataService = require('../services/data-access/pupil.data.service')

const generatePinService = {
  /**
   * Fetch pupils and filter required only pupil attributes
   * @param schoolId
   * @param sortField
   * @param sortDirection
   * @returns {Array}
   */
  getPupils: async (schoolId, sortField, sortDirection) => {
    let pupils = await pupilDataService.getSortedPupils(schoolId, sortField, sortDirection)
    // filter pupils
    pupils = pupils
      .filter(p => !p.pin && !p.attendanceCode && !p.result)
      .map(({_id, pin, dob, foreName, middleNames, lastName}) =>
        ({ _id, pin, dob: moment(dob).format('DD MMM YYYY'), foreName, middleNames, lastName }))
    // determine if more than one pupil has same full name
    pupils.map((p, i) => {
      if (pupils[ i + 1 ] === undefined) return
      if (pupils[ i ].foreName === pupils[ i + 1 ].foreName &&
        pupils[ i ].lastName === pupils[ i + 1 ].lastName) {
        pupils[ i ].showDoB = true
        pupils[ i + 1 ].showDoB = true
      }
    })
    return pupils
  }
}

module.exports = generatePinService
