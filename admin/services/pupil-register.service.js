'use strict'

const pupilRegisterDataService = require('./data-access/pupil-register.data.service')

const pupilRegisterService = {
  /**
   * Identifies whether school's register has incomplete checks.
   * @param {number} schoolId
   * @return {boolean}
   */
  hasIncompleteChecks: async function (schoolId) {
    const result = await pupilRegisterDataService.getIncompleteChecks(schoolId)
    return Array.isArray(result) && result.length > 0
  }
}

module.exports = pupilRegisterService
