'use strict'

const { TYPES } = require('./sql.service')
const R = require('ramda')

const table = '[pupil]'
const pupilDataService = {}
const sqlService = require('./sql.service')

/** SQL METHODS */

/**
 * Fetch all pupils for a school by dfeNumber sorted by specific column.
 * @param dfeNumber
 * @returns {Promise<*>}
 */
pupilDataService.sqlFindPupilsByDfeNumber = async function (dfeNumber) {
  const paramDfeNumber = { name: 'dfeNumber', type: TYPES.Int, value: dfeNumber }

  const sql = `
      SELECT p.*, g.group_id 
      FROM ${sqlService.adminSchema}.${table} p 
      INNER JOIN school s ON s.id = p.school_id
      LEFT JOIN ${sqlService.adminSchema}.[pupilGroup] g ON p.id = g.pupil_id
      WHERE s.dfeNumber = @dfeNumber
      ORDER BY lastName asc      
    `
  const pupils = await sqlService.query(sql, [paramDfeNumber])
  return sqlService.addPupilStatuses(pupils)
}

/**
 * Fetch all pupils for a school by dfeNumber with their status codes
 * @param dfeNumber
 * @returns {Promise<*>}
 */
pupilDataService.sqlFindPupilsWithStatusByDfeNumber = async function (dfeNumber) {
  const paramDfeNumber = { name: 'dfeNumber', type: TYPES.Int, value: dfeNumber }

  const sql = `
      SELECT p.*, ps.code
      FROM ${sqlService.adminSchema}.${table} p
      INNER JOIN school s ON s.id = p.school_id
      LEFT JOIN pupilStatus ps ON (p.pupilStatus_id = ps.id)
      WHERE s.dfeNumber = @dfeNumber
    `
  return sqlService.query(sql, [paramDfeNumber])
}

/**
 * Fetch all pupils for a school by dfeNumber with their status codes and attendance reasons
 * @param dfeNumber
 * @returns {Promise<*>}
 */
pupilDataService.sqlFindPupilsWithStatusAndAttendanceReasons = async function (dfeNumber) {
  const paramDfeNumber = { name: 'dfeNumber', type: TYPES.Int, value: dfeNumber }

  const sql = `
      SELECT p.*, ps.code, pg.group_id, ac.reason, ac.code as reasonCode
      FROM ${sqlService.adminSchema}.${table} p
      INNER JOIN school s
        ON s.id = p.school_id
      LEFT JOIN pupilStatus ps
        ON p.pupilStatus_id = ps.id
      LEFT OUTER JOIN ${sqlService.adminSchema}.[pupilAttendance] pa 
        ON p.id = pa.pupil_id AND (pa.isDeleted IS NULL OR pa.isDeleted = 0)
      LEFT OUTER JOIN ${sqlService.adminSchema}.[attendanceCode] ac 
        ON pa.attendanceCode_id = ac.id 
      LEFT OUTER JOIN ${sqlService.adminSchema}.[pupilGroup] pg
        ON pg.pupil_id = p.id 
      WHERE s.dfeNumber = @dfeNumber
    `
  return sqlService.query(sql, [paramDfeNumber])
}

/**
 * Find a pupil by their urlSlug
 * @param urlSlug - GUID
 * @param schoolId - look for the pupil only in a particular school
 * @return {Promise<void>}
 */
pupilDataService.sqlFindOneBySlug = async function (urlSlug, schoolId) {
  const params = [
    { name: 'urlSlug', type: TYPES.UniqueIdentifier, value: urlSlug },
    { name: 'schoolId', type: TYPES.Int, value: schoolId }
  ]
  const sql = `
      SELECT TOP 1 
      *  
      FROM ${sqlService.adminSchema}.${table}
      WHERE urlSlug = @urlSlug
      AND school_id = @schoolId  
    `
  let results = await sqlService.query(sql, params)
  results = await sqlService.addPupilStatuses(results)
  return R.head(results)
}

/**
 * Find a pupil by their urlSlug with age reason
 * @param urlSlug - GUID
 * @param schoolId - look for the pupil only in a particular school
 * @return {Promise<void>}
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
      FROM ${sqlService.adminSchema}.${table} p
      LEFT OUTER JOIN ${sqlService.adminSchema}.[pupilAgeReason] pag
        ON p.id = pag.pupil_id
      WHERE p.urlSlug = @urlSlug
      AND p.school_id = @schoolId 
    `
  let results = await sqlService.query(sql, params)
  results = await sqlService.addPupilStatuses(results)
  return R.head(results)
}

pupilDataService.sqlFindOneBySlugAndSchool = async function (urlSlug, dfeNumber) {
  const paramSlug = { name: 'urlSlug', type: TYPES.UniqueIdentifier, value: urlSlug }
  const paramDfeNumber = { name: 'dfeNumber', type: TYPES.Int, value: dfeNumber }

  const sql = `
      SELECT TOP 1 
      p.*  
      FROM ${sqlService.adminSchema}.${table} p
      INNER JOIN ${sqlService.adminSchema}.[school] s ON p.school_id = s.id
      WHERE p.urlSlug = @urlSlug  
      AND   s.dfeNumber = @dfeNumber
    `
  let results = await sqlService.query(sql, [paramSlug, paramDfeNumber])
  results = await sqlService.addPupilStatuses(results)
  return R.head(results)
}

/**
 * Find a pupil by upn
 * @param upn
 * @return {Promise<void>}
 */
pupilDataService.sqlFindOneByUpn = async (upn = '') => {
  const param = { name: 'upn', type: TYPES.NVarChar, value: upn.trim().toUpperCase() }
  const sql = `
      SELECT TOP 1 
        *    
      FROM ${sqlService.adminSchema}.${table}
      WHERE upn = @upn    
    `
  const results = await sqlService.query(sql, [param])
  return R.head(results)
}

/**
 * Find a pupil by upn within school
 * @param {String} upn
 * @param {Number} schoolId
 * @return {Promise<void>}
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
      FROM ${sqlService.adminSchema}.${table}
      WHERE upn = @upn
      AND school_id = @schoolId   
    `
  const results = await sqlService.query(sql, params)
  return R.head(results)
}

/**
 * Find a pupil by Id
 * @param id
 * @return {Promise<void>}
 */
pupilDataService.sqlFindOneById = async (id) => {
  const param = { name: 'id', type: TYPES.Int, value: id }
  const sql = `
      SELECT TOP 1 
        *    
      FROM ${sqlService.adminSchema}.${table}
      WHERE id = @id    
    `
  let results = await sqlService.query(sql, [param])
  results = await sqlService.addPupilStatuses(results)
  return R.head(results)
}

/**
 * Find a pupil by Id and check they have rights to that school by checking the school id matches too
 * @param {number} id
 * @param {number} schoolId
 * @return {Promise<void>}
 */
pupilDataService.sqlFindOneByIdAndSchool = async (id, schoolId) => {
  const paramPupil = { name: 'id', type: TYPES.Int, value: id }
  const paramSchool = { name: 'schoolId', type: TYPES.Int, value: schoolId }
  const sql = `
      SELECT TOP 1 
        *    
      FROM ${sqlService.adminSchema}.${table}
      WHERE id = @id and school_id = @schoolId   
    `
  const results = await sqlService.query(sql, [paramPupil, paramSchool])
  return R.head(results)
}

/**
 * Find a pupil by Id and schoolId with associated attendance reasons
 * @param {number} id
 * @param {number} schoolId
 * @return {Promise<void>}
 */
pupilDataService.sqlFindOneWithAttendanceReasonsBySlugAndSchool = async (urlSlug, schoolId) => {
  const paramPupil = { name: 'urlSlug', type: TYPES.UniqueIdentifier, value: urlSlug }
  const paramSchool = { name: 'schoolId', type: TYPES.Int, value: schoolId }
  const sql = `
      SELECT TOP 1 
      p.*, ps.code, pg.group_id, ac.reason, ac.code as reasonCode
      FROM ${sqlService.adminSchema}.${table} p
      LEFT JOIN pupilStatus ps
        ON p.pupilStatus_id = ps.id
      LEFT OUTER JOIN ${sqlService.adminSchema}.[pupilAttendance] pa
        ON p.id = pa.pupil_id AND (pa.isDeleted IS NULL OR pa.isDeleted = 0)
      LEFT OUTER JOIN ${sqlService.adminSchema}.[attendanceCode] ac
        ON pa.attendanceCode_id = ac.id 
      LEFT OUTER JOIN ${sqlService.adminSchema}.[pupilGroup] pg
        ON pg.pupil_id = p.id 
      WHERE p.urlSlug = @urlSlug and school_id = @schoolId 
    `
  let results = await sqlService.query(sql, [paramPupil, paramSchool])
  results = await sqlService.addPupilStatuses(results, 'id', { pupilStatus_id: 'id', code: 'longCode' })
  return R.head(results)
}

/**
 * Find a pupil by school id and pupil pin
 * @param {number} pin
 * @param {number} schoolId
 * @return {Promise<void>}
 */
pupilDataService.sqlFindOneByPinAndSchool = async (pin, schoolId) => {
  const paramPupilPin = { name: 'pin', type: TYPES.NVarChar, value: pin }
  const paramSchool = { name: 'schoolId', type: TYPES.Int, value: schoolId }
  const sql = `
      SELECT TOP 1 
        *    
      FROM ${sqlService.adminSchema}.${table}
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
 * @param dfeNumber
 * @param pinEnv
 * @return {Promise<*>}
 */
pupilDataService.sqlFindPupilsWithActivePins = async (dfeNumber, pinEnv) => {
  // TODO: use pinEnv to differentiate between live and familiarisation
  const paramDfeNumber = { name: 'dfeNumber', type: TYPES.Int, value: dfeNumber }
  const sql = `
  SELECT p.*, g.group_id
  FROM ${sqlService.adminSchema}.${table} p
  INNER JOIN ${sqlService.adminSchema}.[school] s
    ON p.school_id = s.id
  LEFT JOIN  ${sqlService.adminSchema}.[pupilGroup] g
    ON g.pupil_id = p.id
  WHERE p.pin IS NOT NULL
  AND s.dfeNumber = @dfeNumber
  AND p.pinExpiresAt IS NOT NULL
  AND p.pinExpiresAt > GETUTCDATE()
  ORDER BY p.lastName ASC, p.foreName ASC, p.middleNames ASC, dateOfBirth ASC
  `
  const pupils = await sqlService.query(sql, [paramDfeNumber])
  return sqlService.addPupilStatuses(pupils)
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
  FROM ${sqlService.adminSchema}.${table}
  `
  const { params, paramIdentifiers } = sqlService.buildParameterList(slugs, TYPES.UniqueIdentifier)
  const whereClause = 'WHERE urlSlug IN (' + paramIdentifiers.join(', ') + ')' +
    'AND school_id = @schoolId'
  params.push({ name: 'schoolId', type: TYPES.Int, value: schoolId })
  const sql = [select, whereClause].join(' ')
  const pupils = await sqlService.query(sql, params)
  return sqlService.addPupilStatuses(pupils)
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
  FROM ${sqlService.adminSchema}.${table}
  `
  const { params, paramIdentifiers } = sqlService.buildParameterList(ids, TYPES.Int)
  const whereClause = 'WHERE id IN (' + paramIdentifiers.join(', ') + ')' +
    ' AND school_id = @schoolId'
  params.push({ name: 'schoolId', type: TYPES.Int, value: schoolId })
  const orderClause = 'ORDER BY lastName ASC, foreName ASC, middleNames ASC, dateOfBirth ASC'
  const sql = [select, whereClause, orderClause].join(' ')
  const pupils = await sqlService.query(sql, params)
  return sqlService.addPupilStatuses(pupils)
}

/**
 * Find pupils by ids and dfeNumber.
 * @param ids
 * @param dfeNumber
 * @returns {Promise<*>}
 */
pupilDataService.sqlFindByIdAndDfeNumber = async function (ids, dfeNumber) {
  const select = `
      SELECT p.* 
      FROM 
      ${sqlService.adminSchema}.${table} p JOIN [school] s ON p.school_id = s.id
      `
  const { params, paramIdentifiers } = sqlService.buildParameterList(ids, TYPES.Int)
  const whereClause = 'WHERE p.id IN (' + paramIdentifiers.join(', ') + ')'
  const andClause = 'AND s.dfeNumber = @dfeNumber'
  params.push({ name: 'dfeNumber', value: dfeNumber, type: TYPES.Int })
  const sql = [select, whereClause, andClause].join(' ')
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
    update.push(`UPDATE ${sqlService.adminSchema}.${table}
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
 * @param {id: Number, jwtToken: String, jwtSecret: String} pupils
 * @return {Promise}
 */
pupilDataService.sqlUpdateTokensBatch = async (pupils) => {
  const params = []
  const update = []
  pupils.forEach((pupil, i) => {
    update.push(`UPDATE ${sqlService.adminSchema}.${table} SET jwtToken = @jwtToken${i}, jwtSecret = @jwtSecret${i} WHERE id = @id${i}`)
    params.push({ name: `jwtToken${i}`, value: pupil.jwtToken, type: TYPES.NVarChar })
    params.push({ name: `jwtSecret${i}`, value: pupil.jwtSecret, type: TYPES.NVarChar })
    params.push({ name: `id${i}`, value: pupil.id, type: TYPES.Int })
  })
  const sql = update.join('; \n')
  return sqlService.modify(sql, params)
}

/**
 * Find all pupils for a dfeNumber and provide the reason field: null if not present
 * @param {number} dfeNumber
 * @param {string} sortField
 * @param {string} sortDirection
 * @return {Promise<*>}
 */
pupilDataService.sqlFindSortedPupilsWithAttendanceReasons = async (dfeNumber, sortField = 'name', sortDirection = 'ASC') => {
  const safeSort = sortDirection.toUpperCase()
  if (safeSort !== 'ASC' && safeSort !== 'DESC') {
    throw new Error(`Invalid sortDirection: ${safeSort}`)
  }

  // Whitelist the sortFields so we can be sure of the SQL we are generating.
  const allowedSortFields = ['name', 'reason']
  if (R.indexOf(sortField, allowedSortFields) === -1) {
    throw new Error(`Unsupported value for sortField: ${sortField}`)
  }
  let sqlSort
  if (sortField === 'name') {
    sqlSort = `p.lastName ${sortDirection}, p.foreName ${sortDirection}, p.middleNames ${sortDirection}, p.dateOfBirth ${sortDirection}`
  } else if (sortField === 'reason') {
    sqlSort = `CASE WHEN ac.reason IS NULL THEN 1 ELSE 0 END, ac.reason ${sortDirection}`
  }
  const params = [
    { name: 'dfeNumber', type: TYPES.Int, value: dfeNumber }
  ]
  // The order by clause is to sort nulls last
  const sql = `
  SELECT p.*, pg.group_id, ac.reason
  FROM ${sqlService.adminSchema}.${table} p 
    INNER JOIN ${sqlService.adminSchema}.[school] s
      ON p.school_id = s.id
    INNER JOIN ${sqlService.adminSchema}.[pupilStatus] ps
      ON p.pupilStatus_id = ps.id
    LEFT OUTER JOIN ${sqlService.adminSchema}.[pupilAttendance] pa 
      ON p.id = pa.pupil_id AND (pa.isDeleted IS NULL OR pa.isDeleted = 0)
    LEFT OUTER JOIN ${sqlService.adminSchema}.[attendanceCode] ac
      ON pa.attendanceCode_id = ac.id 
    LEFT OUTER JOIN ${sqlService.adminSchema}.[pupilGroup] pg
      ON pg.pupil_id = p.id 
  WHERE s.dfeNumber = @dfeNumber
  AND ps.code = 'UNALLOC'
  ORDER BY ${sqlSort}
  `
  const pupils = await sqlService.query(sql, params)
  return sqlService.addPupilStatuses(pupils)
}

pupilDataService.sqlInsertMany = async (pupils) => {
  const insertSql = `
  DECLARE @output TABLE (id int);
  INSERT INTO ${sqlService.adminSchema}.${table} 
  (school_id, foreName, lastName, middleNames, gender, upn, dateOfBirth)
  OUTPUT inserted.ID INTO @output
  VALUES
  `
  const output = `; SELECT * from @output`
  const values = []
  const params = []

  for (let i = 0; i < pupils.length; i++) {
    values.push(`(@school_id${i}, @foreName${i}, @lastName${i}, @middleNames${i}, @gender${i}, @upn${i}, @dateOfBirth${i})`)
    params.push(
      {
        name: `school_id${i}`,
        value: pupils[i][ 'school_id' ],
        type: TYPES.Int
      },
      {
        name: `foreName${i}`,
        value: pupils[i][ 'foreName' ],
        type: TYPES.NVarChar
      },
      {
        name: `lastName${i}`,
        value: pupils[i][ 'lastName' ],
        type: TYPES.NVarChar
      },
      {
        name: `middleNames${i}`,
        value: pupils[i][ 'middleNames' ],
        type: TYPES.NVarChar
      },
      {
        name: `gender${i}`,
        value: pupils[i][ 'gender' ],
        type: TYPES.Char
      },
      {
        name: `upn${i}`,
        value: pupils[i][ 'upn' ],
        type: TYPES.NVarChar
      },
      {
        name: `dateOfBirth${i}`,
        value: pupils[i][ 'dateOfBirth' ],
        type: TYPES.DateTimeOffset
      }
    )
  }
  const sql = [insertSql, values.join(',\n'), output].join(' ')
  const res = await sqlService.query(sql, params)
  return { insertId: res.map(x => x.id) }
}

module.exports = pupilDataService
