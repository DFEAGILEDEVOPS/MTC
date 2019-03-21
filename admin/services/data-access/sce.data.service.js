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
    school.id,
    sce.timezone,
    sce.countryCode,
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
sceDataService.sqlUpsertSceSchool = async (schoolId, timezone, countryCode) => {
  // TODO: what is isOpen? When is it set?
  const sql = `
  IF NOT EXISTS (SELECT id FROM ${sqlService.adminSchema}.[sce] WHERE school_id = @schoolId)
    INSERT INTO ${sqlService.adminSchema}.[sce] (
      school_id,
      timezone,
      countryCode,
      isOpen
    ) VALUES (
      @schoolId,
      @timezone,
      @countryCode,
      1
    )
  ELSE
    UPDATE ${sqlService.adminSchema}.[sce]
    SET timezone = @timezone, countryCode = @countryCode
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
    },
    {
      name: 'countryCode',
      value: countryCode,
      type: TYPES.Char
    }
  ]
  return sqlService.query(sql, params)
}

/**
  * Batch upsert sce schools using the stored procedure
  *
  * @param {[{school_id, timestamp}]} schools - array of schools to upsert
  * @return {Promise<void>}
  */
sceDataService.sqlUpsertSchoolsBatch = async (schools) => {
  const declareTable = `declare @tvp as [mtc_admin].SceTableType`
  const insertHeader = `INSERT into @tvp
        (school_id, timezone, countryCode, isOpen)
        VALUES`
  const inserts = schools.map((school, index) => {
    return `(@schoolId${index}, @timezone${index}, @countryCode${index}, 1)`
  })
  const params = []
  schools.map((school, index) => {
    params.push({ name: `schoolId${index}`, value: school.id, type: TYPES.Int })
    params.push({ name: `timezone${index}`, value: school.timezone, type: TYPES.NVarChar })
    params.push({ name: `countryCode${index}`, value: school.countryCode, type: TYPES.Char })
  })
  const exec = 'EXEC [mtc_admin].[spUpsertSceSchools] @tvp'
  const insertSql = insertHeader + inserts.join(',\n')
  const sql = [declareTable, schools.length ? insertSql : '', exec].join(';\n')
  const res = await sqlService.query(sql, params)
  const upsertedIds = []
  res.forEach(row => {
    upsertedIds.push(row.id)
  })
  return { upsertId: upsertedIds }
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
