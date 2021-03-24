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
  },

  searchForSchool: async function searchForSchool (query) {
    if (query === undefined || query === null || query === '') {
      throw new Error('query is required')
    }
    if (typeof query !== 'number') {
      throw new Error('Invalid type: number required')
    }
    return await schoolDataService.sqlSearch(query)
  },

  /**
   *
   * @param {string} slug
   * @return {Promise<void>}
   */
  findOneBySlug: async function findOneBySlug (slug) {
    if (slug === '' || slug === undefined) {
      throw new Error('Missing slug')
    }
    return schoolDataService.sqlFindOneBySlug(slug)
  }
}

module.exports = schoolService
