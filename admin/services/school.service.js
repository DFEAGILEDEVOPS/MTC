'use strict'

const schoolDataService = require('../services/data-access/school.data.service')

const schoolService = {

  /**
   * Find school name by DFE number.
   * @param dfeNumber
   * @returns {Promise<string>}
   */
  findSchoolNameByDfeNumber: async (dfeNumber) => {
    const school = await schoolDataService.sqlFindOneByDfeNumber(dfeNumber)
    if (!school) {
      throw new Error(`School [${dfeNumber}] not found`)
    }
    return school.name
  },
  /**
   * Find school by id.
   * @param id {number}
   * @returns {Promise<*>}
   */
  findOneById: function findOneById (id) {
    if (!id) {
      throw new Error('id is required')
    }
    return schoolDataService.sqlFindOneById(id)
  }
}

module.exports = schoolService
