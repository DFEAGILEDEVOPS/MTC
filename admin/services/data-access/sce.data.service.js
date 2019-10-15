'use strict'

const sqlService = require('./sql.service')
const { TYPES } = require('./sql.service')
const sceDataService = {}
const redisCacheService = require('../redis-cache.service')
const sceSpecificLeaCode = 702

/**
 * Find school urns and names
 * @returns {Promise<Array>}
 */
sceDataService.sqlFindSchools = async () => {
  const sql = `
  SELECT
    id,
    name,
    urn,
    urlSlug
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
    school.name,
    school.urn,
    school.urlSlug,
    sce.timezone,
    sce.countryCode
  FROM ${sqlService.adminSchema}.[school]
  LEFT JOIN ${sqlService.adminSchema}.[sce]
    ON sce.school_id = school.id
  WHERE school.leaCode = ${sceSpecificLeaCode}
  OR sce.id IS NOT NULL
  ORDER BY school.name ASC`
  return sqlService.query(sql)
}

/**
 * Inserts or updates data for an sce school
 * @param {number} schoolId
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
  await sqlService.query(sql, params)
  return redisCacheService.drop(`schoolData.sqlFindOneById.${schoolId}`)
}

/**
  * Batch upsert sce schools using the stored procedure
  *
  * @param {[{id, timestamp, timezone, countryCode}]} schools - array of schools to upsert
  * @return {Promise<object>}
  */
sceDataService.sqlUpsertSchoolsBatch = async (schools) => {
  const declareTable = 'declare @tvp as [mtc_admin].SceTableType'
  const insertHeader = `INSERT into @tvp
        (school_id, timezone, countryCode, isOpen)
        VALUES`
  const inserts = schools.map((school, index) => {
    return `(@schoolId${index}, @timezone${index}, @countryCode${index}, 1)`
  })
  const params = []
  schools.map((school, index) => {
    params.push({ name: `schoolId${index}`, value: school.id, type: TYPES.Int })
    params.push({ name: `timezone${index}`, value: school.timezone || '', type: TYPES.NVarChar })
    params.push({ name: `countryCode${index}`, value: school.countryCode || '', type: TYPES.Char })
  })
  const exec = 'EXEC [mtc_admin].[spUpsertSceSchools] @tvp'
  const insertSql = insertHeader + inserts.join(',\n')
  const sql = [declareTable, schools.length ? insertSql : '', exec].join(';\n')
  const res = await sqlService.query(sql, params)
  await redisCacheService.drop(schools.map(s => `schoolData.sqlFindOneById.${s.id}`))
  const upsertedIds = []
  res.forEach(row => {
    upsertedIds.push(row.id)
  })
  return { upsertId: upsertedIds }
}

/**
 * Deletes data for an sce school
 * @param {number} schoolId
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
  await sqlService.query(sql, params)
  return redisCacheService.drop(`schoolData.sqlFindOneById.${schoolId}`)
}

module.exports = sceDataService
