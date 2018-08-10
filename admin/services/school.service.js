'use strict'

const schoolDataService = require('../services/data-access/school.data.service')
const monitor = require('../helpers/monitor')

const schoolService = {

  /**
   * Find school by DFE number.
   * @param dfeNumber
   * @returns {Promise<void>}
   */
  findSchoolByDfeNumber: async (dfeNumber) => {
    const school = await schoolDataService.sqlFindOneByDfeNumber(dfeNumber)
    if (!school) {
      throw new Error(`School [${dfeNumber}] not found`)
    }
    return school.name
  }
}

module.exports = monitor('school.service', schoolService)
