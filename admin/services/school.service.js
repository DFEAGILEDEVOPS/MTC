'use strict'
const uuid = require('uuid')
const schoolDataService = require('../services/data-access/school.data.service')
const schoolValidator = require('../lib/validator/school-validator')

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
   * @return {Promise<object>}
   */
  findOneBySlug: async function findOneBySlug (slug) {
    if (slug === '' || slug === undefined) {
      throw new Error('Missing slug')
    }
    return schoolDataService.sqlFindOneBySlug(slug)
  },

  /**
   * @typedef editableSchoolDetails
   * {
   *   dfeNumber: number,
   *   estabCode: number,
   *   leaCode: number,
   *   name: string,
   *   urn: number
   * }
   */

  /**
   * Update details for a school
   * @param {string} slug - unique UUID to update
   * @param {editableSchoolDetails} school
   */
  updateSchool: async function updateSchool (slug, school) {
    if (!slug) {
      throw new Error('Missing UUID')
    }
    if (!uuid.validate(slug)) {
      throw new Error(`Invalid UUID: ${slug}`)
    }
    if (!school) {
      throw new Error('Missing school details')
    }
    const validationError = await schoolValidator.validate(school)
    if (validationError.hasError()) {
      throw validationError
    }
    return schoolDataService.sqlUpdateBySlug(slug, school)
  }
}

module.exports = schoolService
