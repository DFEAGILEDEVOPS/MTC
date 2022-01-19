'use strict'
const uuid = require('uuid')
const schoolDataService = require('../services/data-access/school.data.service')
const schoolAuditDataService = require('../services/data-access/school-audit.data.service')
const schoolValidator = require('../lib/validator/school-validator')
const ValidationError = require('../lib/validation-error')
const auditTypes = require('../lib/consts/audit-entry-types')

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
  findOneById: async function findOneById (id) {
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
   * @typedef {object} schoolRecord
   * @property {number } id
   * @property {string} name,
   * @property {number} leaCode,
   * @property {number} estabCode,
   * @property {number} dfeNumber,
   * @property {number} urn,
   * @property {string} urlSlug,
   * @property {number} numberOfPupils
   */

  /**
   * @param {string} slug
   * @return {Promise<schoolRecord>}
   */
  findOneBySlug: async function findOneBySlug (slug) {
    if (slug === '' || slug === undefined) {
      throw new Error('Missing slug')
    }
    return schoolDataService.sqlFindOneBySlug(slug)
  },

  /**
   * @typedef {object} editableSchoolDetails
   * @property {number} dfeNumber,
   * @property {number} estabCode,
   * @property {number} leaCode,
   * @property {string} name,
   * @property {number} urn,
   * @property {number } id
   */

  /**
   * Update details for a school
   * @param {string} slug - unique UUID to update
   * @param {editableSchoolDetails} school
   * @param {number} userId
   */
  updateSchool: async function updateSchool (slug, school, userId) {
    if (!slug) {
      throw new Error('Missing UUID')
    }
    if (!uuid.validate(slug)) {
      throw new Error(`Invalid UUID: ${slug}`)
    }
    if (!school) {
      throw new Error('Missing school details')
    }
    if (!userId) {
      throw new Error('Missing userId')
    }
    const validationError = await schoolValidator.validate(school)
    if (validationError.hasError()) {
      throw validationError
    }
    await schoolAuditDataService.createEntry({
      auditOperationTypeId: auditTypes.update,
      newData: school,
      schoolId: school.id,
      userId: userId
    })
    return schoolDataService.sqlUpdateBySlug(slug, school, userId)
  },

  /**
   * Parse the lea and estab codes from the dfeNumber
   * @param dfeNumber
   * @returns {{estabCode: number, leaCode: number}}
   */
  parseDfeNumber: function (dfeNumber) {
    if (typeof dfeNumber !== 'number') {
      throw new ValidationError('dfeNumber', 'The dfeNumber must be 7 digits')
    }
    if (dfeNumber <= 999999 || dfeNumber >= 10000000) {
      throw new ValidationError('dfeNumber', 'The dfeNumber must be 7 digits')
    }
    return {
      leaCode: parseInt(dfeNumber.toString().slice(0, 3), 10),
      estabCode: parseInt(dfeNumber.toString().slice(3), 10)
    }
  },

  /**
   * @typedef newSchoolDetails
   * {
   *   dfeNumber: number,
   *   name: string,
   *   urn: number,
   * }
   */

  /**
   * Service manager - add a new School
   * @param {newSchoolDetails} newSchoolDetails
   * @param {number} userId
   */
  addSchool: async function addSchool (newSchoolDetails, userId) {
    const parsed = this.parseDfeNumber(newSchoolDetails.dfeNumber)
    const insertDetails = {
      estabCode: parsed.estabCode,
      leaCode: parsed.leaCode,
      ...newSchoolDetails
    }
    const validationError = await schoolValidator.validate(insertDetails)
    if (validationError.hasError()) {
      throw validationError
    }
    await schoolDataService.sqlAddSchool(insertDetails, userId)
  }
}

module.exports = schoolService
