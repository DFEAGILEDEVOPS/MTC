'use strict'

const { TYPES } = require('./sql.service')
const R = require('ramda')

const table = '[pupil]'
const pupilDataService = {}
const sqlService = require('./sql.service')

/** SQL METHODS */

/**
 * Fetch all pupils for a school by schoolId sorted by specific column.
 * @param schoolId
 * @returns {Promise<*>}
 */
pupilDataService.sqlFindPupilsBySchoolId = async function (schoolId) {
  const paramSchoolId = { name: 'schoolId', type: TYPES.Int, value: schoolId }

  const sql = `
  SELECT *
  FROM [mtc_admin].[pupil] p
  WHERE p.school_id = @schoolId
  ORDER BY lastName asc
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
 * Find a pupil by their urlSlug with age reason
 * @param urlSlug - GUID
 * @param schoolId - look for the pupil only in a particular school
 * @return {Promise<object>}
 */
pupilDataService.sqlFindOneBySlugWithAgeReason = async function (urlSlug, schoolId) {
  const params = [
    { name: 'urlSlug', type: TYPES.UniqueIdentifier, value: urlSlug },
    { name: 'schoolId', type: TYPES.Int, value: schoolId }
  ]
  const sql = `
      SELECT TOP 1
      p.*,
      pag.reason AS ageReason
      FROM [mtc_admin].[pupil] p
      LEFT OUTER JOIN [mtc_admin].[pupilAgeReason] pag
        ON p.id = pag.pupil_id
      WHERE p.urlSlug = @urlSlug
      AND p.school_id = @schoolId
    `
  const results = await sqlService.query(sql, params)
  return R.head(results)
}

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
 * Find a pupil by Id and schoolId with associated attendance reasons
 * @param {string} urlSlug
 * @param {number} schoolId
 * @return {Promise<object>}
 */
pupilDataService.sqlFindOneWithAttendanceReasonsBySlugAndSchool = async (urlSlug, schoolId) => {
  const paramPupil = { name: 'urlSlug', type: TYPES.UniqueIdentifier, value: urlSlug }
  const paramSchool = { name: 'schoolId', type: TYPES.Int, value: schoolId }
  const sql = `
  SELECT TOP 1
  p.*, ps.code, ac.reason, ac.code as reasonCode
  FROM [mtc_admin].[pupil] p
  LEFT JOIN pupilStatus ps
    ON p.pupilStatus_id = ps.id
  LEFT OUTER JOIN [mtc_admin].[pupilAttendance] pa
    ON p.id = pa.pupil_id AND (pa.isDeleted IS NULL OR pa.isDeleted = 0)
  LEFT OUTER JOIN [mtc_admin].[attendanceCode] ac
    ON pa.attendanceCode_id = ac.id
  WHERE p.urlSlug = @urlSlug and school_id = @schoolId
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
 * @return  { insertId: <number>, rowsModified: <number> }
 */
pupilDataService.sqlCreate = async (data) => {
  return sqlService.create(table, data)
}

/**
 * Find pupils for a school with pins that have not yet expired, for
 * a specific pin environment (live / fam)
 * @param schoolId
 * @param pinEnv
 * @return {Promise<*>}
 */
pupilDataService.sqlFindPupilsWithActivePins = async (schoolId, pinEnv) => {
  // TODO: use pinEnv to differentiate between live and familiarisation
  const paramSchoolId = { name: 'schoolId', type: TYPES.Int, value: schoolId }
  const sql = `
  SELECT p.*
  FROM [mtc_admin].[pupil] p
  WHERE p.pin IS NOT NULL
  AND p.school_id = @schoolId
  AND p.pinExpiresAt IS NOT NULL
  AND p.pinExpiresAt > GETUTCDATE()
  ORDER BY p.lastName ASC, p.foreName ASC, p.middleNames ASC, dateOfBirth ASC
  `
  return sqlService.query(sql, [paramSchoolId])
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

/**
 * Batch update pupil pins for specific pin env (live/fam)
 * @param pupils
 * @param pinEnv
 * @return {Promise<void>}
 */
pupilDataService.sqlUpdatePinsBatch = async (pupils, pinEnv = 'live') => {
  // TODO: use pinEnv to differentiate between the live and familiarisation checks
  const params = []
  const update = []
  pupils.forEach((p, i) => {
    update.push(`UPDATE [mtc_admin].[pupil]
    SET pin = @pin${i}, pinExpiresAt=@pinExpiredAt${i}
    WHERE id = @id${i}`)
    params.push({
      name: `pin${i}`,
      value: p.pin,
      type: TYPES.NVarChar
    })
    params.push({
      name: `pinExpiredAt${i}`,
      value: p.pinExpiresAt,
      type: TYPES.DateTimeOffset
    })
    params.push({
      name: `id${i}`,
      value: p.id,
      type: TYPES.Int
    })
  })
  const sql = update.join(';\n')
  return sqlService.modify(sql, params)
}
/**
 * Update several pupil tokens in one query
 * @param {id: number, jwtToken: String, jwtSecret: String} pupils
 * @return {Promise}
 */
pupilDataService.sqlUpdateTokensBatch = async (pupils) => {
  const params = []
  const update = []
  pupils.forEach((pupil, i) => {
    update.push(`UPDATE [mtc_admin].[pupil] SET jwtToken = @jwtToken${i}, jwtSecret = @jwtSecret${i} WHERE id = @id${i}`)
    params.push({ name: `jwtToken${i}`, value: pupil.jwtToken, type: TYPES.NVarChar })
    params.push({ name: `jwtSecret${i}`, value: pupil.jwtSecret, type: TYPES.NVarChar })
    params.push({ name: `id${i}`, value: pupil.id, type: TYPES.Int })
  })
  const sql = update.join('; \n')
  return sqlService.modify(sql, params)
}

pupilDataService.sqlInsertMany = async (pupils) => {
  const insertSql = `
  DECLARE @output TABLE (id int);
  INSERT INTO [mtc_admin].[pupil]
  (school_id, foreName, lastName, middleNames, gender, upn, dateOfBirth)
  OUTPUT inserted.ID INTO @output
  VALUES
  `
  const output = '; SELECT * from @output'
  const values = []
  const params = []

  for (let i = 0; i < pupils.length; i++) {
    values.push(`(@school_id${i}, @foreName${i}, @lastName${i}, @middleNames${i}, @gender${i}, @upn${i}, @dateOfBirth${i})`)
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
      }
    )
  }
  const sql = [insertSql, values.join(',\n'), output].join(' ')
  const res = await sqlService.query(sql, params)
  return { insertId: res.map(x => x.id) }
}

module.exports = pupilDataService
