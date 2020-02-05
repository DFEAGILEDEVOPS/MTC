'use strict'

const { TYPES } = require('./sql.service')
const R = require('ramda')
const sqlService = require('./sql.service')
const pupilStatusDataService = {}

pupilStatusDataService.sqlFindPupilsFullStatus = async (schoolId) => {
  if (!schoolId) {
    throw new Error('schoolId param is required')
  }
  const paramSchoolId = { name: 'schoolId', type: TYPES.Int, value: schoolId }
  const sql = `
    SELECT * FROM [mtc_admin].[vewPupilStatus]
    WHERE school_id = @schoolId
  `
  return sqlService.readonlyQuery(sql, [paramSchoolId])
}

/**
 * Find a particular pupil with full status attributes
 * @param {string} urlSlug
 * @param {number} schoolId
 * @return {Promise<*>}
 */
pupilStatusDataService.sqlFindOnePupilFullStatus = async (urlSlug, schoolId) => {
  if (!urlSlug) {
    throw new Error('urlSlug param is required')
  }
  if (!schoolId) {
    throw new Error('schoolId param is required')
  }
  const paramSchoolId = { name: 'schoolId', type: TYPES.Int, value: schoolId }
  const paramUrlSlug = { name: 'urlSlug', type: TYPES.UniqueIdentifier, value: urlSlug }
  const sql = `
    SELECT * FROM [mtc_admin].[vewPupilStatus]
    WHERE school_id = @schoolId
    AND urlSlug = @urlSlug
  `
  const results = await sqlService.readonlyQuery(sql, [paramSchoolId, paramUrlSlug])
  return R.head(results)
}

module.exports = pupilStatusDataService
