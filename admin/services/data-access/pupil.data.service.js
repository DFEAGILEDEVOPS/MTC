'use strict'

const { TYPES } = require('tedious')
const R = require('ramda')
const pupilDataService = {}
const moment = require('moment')
const table = '[pupil]'
const sqlService = require('./sql.service')
const config = require('../../config')

/** SQL METHODS */

/**
 * Fetch all pupils for a school by dfeNumber sorted by specific column.
 * @param dfeNumber
 * @param sortDirection
 * @returns {Promise<*>}
 */
pupilDataService.sqlFindPupilsByDfeNumber = async function (dfeNumber, sortDirection) {
  const paramDfeNumber = { name: 'dfeNumber', type: TYPES.Int, value: dfeNumber }
  sortDirection = sortDirection === 'asc' ? 'asc' : 'desc'
  const sortBy = `lastName ${sortDirection}, foreName ${sortDirection}, middleNames ${sortDirection}, dateOfBirth ${sortDirection}`

  const sql = `
      SELECT p.*, g.group_id 
      FROM ${sqlService.adminSchema}.${table} p 
      INNER JOIN school s ON s.id = p.school_id
      LEFT JOIN ${sqlService.adminSchema}.[pupilGroup] g ON p.id = g.pupil_id
      WHERE s.dfeNumber = @dfeNumber
      ORDER BY ${sortBy}      
    `
  return sqlService.query(sql, [paramDfeNumber])
}

/**
 * Find a pupil by their urlSlug
 * @param urlSlug
 * @return {Promise<void>}
 */
pupilDataService.sqlFindOneBySlug = async function (urlSlug) {
  const param = { name: 'urlSlug', type: TYPES.UniqueIdentifier, value: urlSlug }
  const sql = `
      SELECT TOP 1 
      *  
      FROM ${sqlService.adminSchema}.${table}
      WHERE urlSlug = @urlSlug    
    `
  const results = await sqlService.query(sql, [param])
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
  const results = await sqlService.query(sql, [paramSlug, paramDfeNumber])
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
  const results = await sqlService.query(sql, [param])
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
 * Find pupils for a school with pins that have not yet expired
 * @param dfeNumber
 * @return {Promise<*>}
 */
pupilDataService.sqlFindPupilsWithActivePins = async (dfeNumber) => {
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
  return sqlService.query(sql, [paramDfeNumber])
}

/**
 * Find pupils using urlSlugs
 * @param {Array|string} slugs
 * @return {Promise<*>}
 */
pupilDataService.sqlFindPupilsByUrlSlug = async (slugs) => {
  if (!(Array.isArray(slugs) && slugs.length > 0)) {
    throw new Error('No slugs provided')
  }
  const select = `
  SELECT *
  FROM ${sqlService.adminSchema}.${table}
  `
  const {params, paramIdentifiers} = sqlService.buildParameterList(slugs, TYPES.UniqueIdentifier)
  const whereClause = 'WHERE urlSlug IN (' + paramIdentifiers.join(', ') + ')'
  const sql = [select, whereClause].join(' ')
  return sqlService.query(sql, params)
}

/**
 * Find pupils by ids
 * @param ids
 * @return {Promise<void>}
 */
pupilDataService.sqlFindByIds = async (ids) => {
  if (!(Array.isArray(ids) && ids.length > 0)) {
    throw new Error('No ids provided')
  }
  const select = `
  SELECT *
  FROM ${sqlService.adminSchema}.${table}
  `
  const {params, paramIdentifiers} = sqlService.buildParameterList(ids, TYPES.Int)
  const whereClause = 'WHERE id IN (' + paramIdentifiers.join(', ') + ')'
  const orderClause = 'ORDER BY lastName ASC, foreName ASC, middleNames ASC, dateOfBirth ASC'
  const sql = [select, whereClause, orderClause].join(' ')
  return sqlService.query(sql, params)
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
  const {params, paramIdentifiers} = sqlService.buildParameterList(ids, TYPES.Int)
  const whereClause = 'WHERE p.id IN (' + paramIdentifiers.join(', ') + ')'
  const andClause = 'AND s.dfeNumber = @dfeNumber'
  params.push({name: 'dfeNumber', value: dfeNumber, type: TYPES.Int})
  const sql = [select, whereClause, andClause].join(' ')
  return sqlService.query(sql, params)
}

/**
 * Batch update pupil pins
 * @param pupils
 * @return {Promise<void>}
 */
pupilDataService.sqlUpdatePinsBatch = async (pupils) => {
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
    INNER JOIN ${sqlService.adminSchema}.[school] s ON p.school_id = s.id
    LEFT OUTER JOIN ${sqlService.adminSchema}.[pupilAttendance] pa ON p.id = pa.pupil_id AND (pa.isDeleted IS NULL OR pa.isDeleted = 0)
    LEFT OUTER JOIN ${sqlService.adminSchema}.[attendanceCode] ac ON pa.attendanceCode_id = ac.id 
    LEFT OUTER JOIN ${sqlService.adminSchema}.[pupilGroup] pg ON pg.pupil_id = p.id 
  WHERE s.dfeNumber = @dfeNumber
  ORDER BY ${sqlSort}
  `
  return sqlService.query(sql, params)
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
  return sqlService.modify(sql, params)
  // E.g. { insertId: [1, 2], rowsModified: 4 }
}

/**
 * Execute pupil data bulk import
 * @param {Object} connection
 * @param {Array} pupilData
 * @param {Array} schools
 * @return {Promise<*>}
 */
pupilDataService.sqlBulkImport = async(connection, pupilData, schools) => {
  const result = {}
  if (!connection) {
    result.errorOutput = 'Connection not initialised'
    return result
  }
  // optional BulkLoad options
  const options = {keepNulls: true}

  // **WIP**
  // Needs to be async
  const bulkLoad = connection.newBulkLoad(`${config.Sql.Database}.${sqlService.adminSchema}.${table}`, options, function (error, rowCount) {
    if (error) {
      result.errorOutput = error
      return result
    }
  })

  bulkLoad.addColumn('school_id', TYPES.Int, {nullable: false})
  bulkLoad.addColumn('upn', TYPES.Char, {length: 13, nullable: false})
  bulkLoad.addColumn('lastName', TYPES.NVarChar, {length: 'max', nullable: false})
  bulkLoad.addColumn('foreName', TYPES.NVarChar, {length: 'max', nullable: false})
  bulkLoad.addColumn('middleNames', TYPES.NVarChar, {length: 'max', nullable: true})
  bulkLoad.addColumn('gender', TYPES.Char, {length: 1, nullable: false})
  bulkLoad.addColumn('dateOfBirth', TYPES.DateTimeOffset, {nullable: false})

  for (let index = 0; index < pupilData.length; index++) {
    const csvRow = pupilData[index]
    const dfeNumber = `${csvRow[0]}${csvRow[1]}`
    const school = schools.find(s => s.dfeNumber === parseInt(dfeNumber))
    const schoolId = school && school.id
    if (!schoolId) {
      result.errorOutput = `School id not found for DfeNumber ${dfeNumber} for pupil on row number ${index + 1}`
      return result
    }
    bulkLoad.addRow({
      school_id: schoolId,
      upn: csvRow[2],
      lastName: csvRow[3],
      foreName: csvRow[4],
      middleNames: csvRow[5],
      gender: csvRow[6],
      dateOfBirth: moment(csvRow[7], 'MM/DD/YY').toDate()
    })
  }
  connection.execBulkLoad(bulkLoad)
  result.output = `Inserted ${pupilData.length} rows`
  return result
}

module.exports = pupilDataService
