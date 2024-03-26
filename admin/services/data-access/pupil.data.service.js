'use strict'

const { TYPES } = require('./sql.service')
const R = require('ramda')

const table = '[pupil]'
const pupilDataService = {}
const sqlService = require('./sql.service')

/** SQL METHODS */

/**
 * Fetch all pupils for a school by schoolId, unsorted.
 * @param schoolId
 * @returns {Promise<*>}
 */
pupilDataService.sqlFindPupilsBySchoolId = async function (schoolId) {
  const paramSchoolId = { name: 'schoolId', type: TYPES.Int, value: schoolId }

  const sql = `
  SELECT *
  FROM [mtc_admin].[pupil] p
  WHERE p.school_id = @schoolId
    `
  return sqlService.query(sql, [paramSchoolId])
}

/**
 * Find a pupil by their urlSlug
 * @param urlSlug - GUID
 * @param schoolId - look for the pupil only in a particular school
 * @return {Promise<object>}
 */
pupilDataService.sqlFindOneBySlug = async function (urlSlug, schoolId) {
  const params = [
    { name: 'urlSlug', type: TYPES.UniqueIdentifier, value: urlSlug },
    { name: 'schoolId', type: TYPES.Int, value: schoolId }
  ]
  const sql = `
      SELECT TOP 1
      *
      FROM [mtc_admin].[pupil]
      WHERE urlSlug = @urlSlug
      AND school_id = @schoolId
    `
  const results = await sqlService.query(sql, params)
  return R.head(results)
}

/**
 * @typedef {object} PupilData
 * @property {number} id
 */

/**
 * @param {string} urlSlug
 * @param {number} schoolId
 * @returns {Promise<PupilData>}
 */
pupilDataService.sqlFindOneBySlugAndSchool = async function (urlSlug, schoolId) {
  const paramSlug = { name: 'urlSlug', type: TYPES.UniqueIdentifier, value: urlSlug }
  const paramSchoolId = { name: 'schoolId', type: TYPES.Int, value: schoolId }

  const sql = `
      SELECT TOP 1
      p.*
      FROM [mtc_admin].[pupil] p
      WHERE p.urlSlug = @urlSlug
      AND p.school_id = @schoolId
    `
  const results = await sqlService.query(sql, [paramSlug, paramSchoolId])
  // @ts-ignore
  return R.head(results)
}

/**
 * Find a pupil by upn
 * @param upn
 * @return {Promise<object>}
 */
pupilDataService.sqlFindOneByUpn = async (upn = '') => {
  const param = { name: 'upn', type: TYPES.NVarChar, value: upn.trim().toUpperCase() }
  const sql = `
      SELECT TOP 1
        *
      FROM [mtc_admin].[pupil]
      WHERE upn = @upn
    `
  const results = await sqlService.query(sql, [param])
  return R.head(results)
}

/**
 * Find a pupil by upn within school
 * @param {String} upn
 * @param {Number} schoolId
 * @return {Promise<object>}
 */
pupilDataService.sqlFindOneByUpnAndSchoolId = async (upn, schoolId) => {
  const params = [
    {
      name: 'upn',
      type: TYPES.NVarChar,
      value: upn.trim().toUpperCase()
    },
    {
      name: 'schoolId',
      type: TYPES.Int,
      value: schoolId
    }
  ]
  const sql = `
      SELECT TOP 1
      *
      FROM [mtc_admin].[pupil]
      WHERE upn = @upn
      AND school_id = @schoolId
    `
  const results = await sqlService.query(sql, params)
  return R.head(results)
}

/**
 * Find a pupil by Id
 * @param id
 * @return {Promise<object>}
 */
pupilDataService.sqlFindOneById = async (id) => {
  const param = { name: 'id', type: TYPES.Int, value: id }
  const sql = `
      SELECT TOP 1
        *
      FROM [mtc_admin].[pupil]
      WHERE id = @id
    `
  const results = await sqlService.query(sql, [param])
  return R.head(results)
}

/**
 * Find a pupil by Id and check they have rights to that school by checking the school id matches too
 * @param {number} id
 * @param {number} schoolId
 * @return {Promise<object>}
 */
pupilDataService.sqlFindOneByIdAndSchool = async (id, schoolId) => {
  const paramPupil = { name: 'id', type: TYPES.Int, value: id }
  const paramSchool = { name: 'schoolId', type: TYPES.Int, value: schoolId }
  const sql = `
      SELECT TOP 1
        *
      FROM [mtc_admin].[pupil]
      WHERE id = @id and school_id = @schoolId
    `
  const results = await sqlService.query(sql, [paramPupil, paramSchool])
  return R.head(results)
}

/**
 * Find a pupil by school id and pupil pin
 * @param {number} pin
 * @param {number} schoolId
 * @return {Promise<object>}
 */
pupilDataService.sqlFindOneByPinAndSchool = async (pin, schoolId) => {
  const paramPupilPin = { name: 'pin', type: TYPES.NVarChar, value: pin }
  const paramSchool = { name: 'schoolId', type: TYPES.Int, value: schoolId }
  const sql = `
      SELECT TOP 1
        *
      FROM [mtc_admin].[pupil]
      WHERE pin = @pin and school_id = @schoolId
    `
  const results = await sqlService.query(sql, [paramPupilPin, paramSchool])
  return R.head(results)
}

/**
 * Update am existing pupil object.  Must provide the `id` field
 * @param update
 * @return {Promise<*>}
 */
pupilDataService.sqlUpdate = async (update) => {
  return sqlService.update(table, update)
}

/**
 * Create a new pupil.
 * @param {object} data
 * @return  {Promise<any>}
 */
pupilDataService.sqlCreate = async (data) => {
  return sqlService.create(table, data)
}

/**
 * Find pupils using urlSlugs
 * @param {Array|string} slugs
 * @return {Promise<*>}
 */
pupilDataService.sqlFindPupilsByUrlSlug = async (slugs, schoolId) => {
  if (!(Array.isArray(slugs) && slugs.length > 0)) {
    throw new Error('No slugs provided')
  }

  if (!schoolId) {
    throw new Error('Required parameter `schoolId` missing')
  }

  const select = `
  SELECT *
  FROM [mtc_admin].[pupil]
  `
  const { params, paramIdentifiers } = sqlService.buildParameterList(slugs, TYPES.UniqueIdentifier)
  const whereClause = 'WHERE urlSlug IN (' + paramIdentifiers.join(', ') + ')' +
    'AND school_id = @schoolId'
  params.push({ name: 'schoolId', type: TYPES.Int, value: schoolId })
  const sql = [select, whereClause].join(' ')
  return sqlService.query(sql, params)
}

/**
 * Find pupils by ids
 * @param ids
 * @param {Number} schoolId - `school.id` database ID
 * @return {Promise<*>}
 */
pupilDataService.sqlFindByIds = async (ids, schoolId) => {
  if (!(Array.isArray(ids) && ids.length > 0)) {
    throw new Error('No ids provided')
  }
  if (!schoolId) {
    throw new Error('No `schoolId` provided')
  }

  const select = `
  SELECT *
  FROM [mtc_admin].[pupil]
  `
  const { params, paramIdentifiers } = sqlService.buildParameterList(ids, TYPES.Int)
  const whereClause = 'WHERE id IN (' + paramIdentifiers.join(', ') + ')' +
    ' AND school_id = @schoolId'
  params.push({ name: 'schoolId', type: TYPES.Int, value: schoolId })
  const orderClause = 'ORDER BY lastName ASC, foreName ASC, middleNames ASC, dateOfBirth ASC'
  const sql = [select, whereClause, orderClause].join(' ')
  return sqlService.query(sql, params)
}

pupilDataService.sqlInsertMany = async (pupils, userId) => {
  const insertSql = `
  DECLARE @output TABLE (id int);
  INSERT INTO [mtc_admin].[pupil]
  (school_id, foreName, lastName, middleNames, gender, upn, dateOfBirth, lastModifiedBy_userId)
  OUTPUT inserted.ID INTO @output
  VALUES
  `
  const output = '; SELECT * from @output'
  const values = []
  const params = []

  for (let i = 0; i < pupils.length; i++) {
    values.push(`(@school_id${i}, @foreName${i}, @lastName${i}, @middleNames${i}, @gender${i}, @upn${i}, @dateOfBirth${i}, @lastModifiedByUserId${i})`)
    params.push(
      {
        name: `school_id${i}`,
        value: pupils[i].school_id,
        type: TYPES.Int
      },
      {
        name: `foreName${i}`,
        value: pupils[i].foreName,
        type: TYPES.NVarChar
      },
      {
        name: `lastName${i}`,
        value: pupils[i].lastName,
        type: TYPES.NVarChar
      },
      {
        name: `middleNames${i}`,
        value: pupils[i].middleNames,
        type: TYPES.NVarChar
      },
      {
        name: `gender${i}`,
        value: pupils[i].gender,
        type: TYPES.Char
      },
      {
        name: `upn${i}`,
        value: pupils[i].upn,
        type: TYPES.NVarChar
      },
      {
        name: `dateOfBirth${i}`,
        value: pupils[i].dateOfBirth,
        type: TYPES.DateTimeOffset
      },
      {
        name: `lastModifiedByUserId${i}`,
        value: userId,
        type: TYPES.Int
      }
    )
  }
  const sql = [insertSql, values.join(',\n'), output].join(' ')
  const res = await sqlService.query(sql, params)
  return { insertId: res.map(x => x.id) }
}

module.exports = pupilDataService
