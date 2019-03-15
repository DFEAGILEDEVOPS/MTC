'use strict'

const sqlService = require('./sql.service')
const { TYPES } = require('./sql.service')
const sceDataService = {}

/**
 * Find school urns and names
 * @returns {Promise<Array>}
 */
sceDataService.sqlFindSchools = async () => {
  const sql = `
  SELECT
    id,
    name,
    urn
  FROM ${sqlService.adminSchema}.[school]
  ORDER BY name ASC`
  return sqlService.query(sql)
}

/**
 * Find sce schools
 * @returns {Promise<Array>}
 */
sceDataService.sqlFindSceSchools = async () => {
  const sql = `
  SELECT
    sce.timezone,
    school.name,
    school.urn
  FROM ${sqlService.adminSchema}.[sce]
  LEFT JOIN ${sqlService.adminSchema}.[school]
    ON school.id = sce.school_id
  ORDER BY school.name ASC`
  return sqlService.query(sql)
}

/**
 * Inserts or updates data for an sce school
 * @param {int} schoolId
 * @param {string} timezone
 * @return {Promise<Object>}
 */
sceDataService.sqlUpsertSceSchool = async (schoolId, timezone) => {
  // TODO: what is isOpen? When is it set?
  const sql = `
  IF NOT EXISTS (SELECT id FROM ${sqlService.adminSchema}.[sce] WHERE school_id = @schoolId)
    INSERT INTO ${sqlService.adminSchema}.[sce] (
      school_id,
      timezone,
      isOpen
    ) VALUES (
      @schoolId,
      @timezone,
      1
    )
  ELSE
    UPDATE ${sqlService.adminSchema}.[sce]
    SET timezone = @timezone
    WHERE school_id = @schoolId
  `
  const params = [
    {
      name: 'schoolId',
      value: schoolId,
      type: TYPES.Int
    },
    {
      name: 'timezone',
      value: timezone,
      type: TYPES.NVarChar
    }
  ]
  return sqlService.query(sql, params)
}

/**
 * Deletes data for an sce school
 * @param {int} schoolId
 * @return {Promise<Object>}
 */
sceDataService.sqlDeleteSceSchool = async (schoolId) => {
  const sql = `
  DELETE FROM ${sqlService.adminSchema}.[sce] WHERE school_id = @schoolId
  `
  const params = [
    {
      name: 'schoolId',
      value: schoolId,
      type: TYPES.Int
    }
  ]
  return sqlService.query(sql, params)
}

module.exports = sceDataService
