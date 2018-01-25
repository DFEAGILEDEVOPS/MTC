'use strict'

const winston = require('winston')
const { TYPES } = require('tedious')
const R = require('ramda')

const Pupil = require('../../models/pupil')
const School = require('../../models/school')
const PupilStatusCode = require('../../models/pupil-status-code')
const pupilDataService = {}
const table = '[pupil]'
const sqlService = require('./sql.service')

/**
 * Returns an object that consists of a plain JS school data and pupils.
 * @param {number} schoolId - School unique Id.
 * @deprecated Use an sql* methods instead
 * @return {Object}
 */
pupilDataService.getPupils = async (schoolId) => {
  winston.warn('*** pupilDataService.getPupils is deprecated ***')
  const [ schoolData, pupils ] = await Promise.all([
    School.findOne({'_id': schoolId}).lean().exec(),
    Pupil.find({ school: schoolId }).sort({ createdAt: 1 }).lean().exec()
  ]).catch((error) => {
    throw new Error(error)
  })
  return {
    schoolData,
    pupils
  }
}

/**
 * Returns pupils filtered by school and sorted by field and direction (asc/desc)
 * @deprecated use sqlFindPupilsByDfeNumber instead
 * @param schoolId
 * @param sortingField
 * @param sortingDirection
 * @returns {Array}
 */
pupilDataService.getSortedPupils = async (schoolId, sortingField, sortingDirection) => {
  winston.warn('*** pupilDataService.getSortedPupils is deprecated ***')
  const sort = {}
  sort[sortingField || 'lastName'] = sortingDirection || 'asc'
  return Pupil
    .find({'school': schoolId})
    .sort(sort)
    .lean()
    .exec()
}

/**
 * Find all pupils for a dfeNumber and provide the reason field: null if not present
 * @param {number} dfeNumber
 * @param {number} groupId
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
    sqlSort = `p.lastName ${sortDirection}, p.foreName ${sortDirection}`
  } else if (sortField === 'reason') {
    sqlSort = `ac.reason ${sortDirection}`
  }
  const params = [
    { name: 'dfeNumber', type: TYPES.Int, value: dfeNumber }
  ]
  // The order by clause is to sort nulls last
  const sql = `
  SELECT p.*, pg.group_id, ac.reason
  FROM ${sqlService.adminSchema}.${table} p 
    INNER JOIN ${sqlService.adminSchema}.[school] s ON p.school_id = s.id
    LEFT OUTER JOIN ${sqlService.adminSchema}.[pupilAttendance] pa ON p.id = pa.pupil_id 
    LEFT OUTER JOIN ${sqlService.adminSchema}.[attendanceCode] ac ON pa.attendanceCode_id = ac.id
    LEFT OUTER JOIN ${sqlService.adminSchema}.[pupilGroup] pg ON pg.pupil_id = p.id 
  WHERE s.dfeNumber = @dfeNumber
  ORDER BY CASE WHEN ac.reason IS NULL THEN 1 ELSE 0 END, ${sqlSort}
  `
  return sqlService.query(sql, params)
}

/**
 * Insert a list of pupils in the db
 * @deprecated use sqlInsertMany instead
 * @param pupils
 * @return {Array}
 */
pupilDataService.insertMany = async (pupils) => {
  winston.warn('*** pupilDataService.insertMany is deprecated ***')
  const mongoosePupils = pupils.map(p => new Pupil(p))
  const savedPupils = await Pupil.insertMany(mongoosePupils)
  return savedPupils
}

/**
 * Find a single pupil by criteria in `options`
 * @deprecated use sqlFindOneById instead
 * @param options
 * @return {Promise.<{Object}>}
 */
pupilDataService.findOne = async function (options) {
  winston.warn('*** pupilDataService.findOne is deprecated ***')
  return Pupil.findOne(options).populate('school').lean().exec()
}

/**
 * Find and return non-lean pupils by criteria in `options`
 * @param options
 * @return {Promise.<{Object}>}
 * @deprecated create a new custom sql method
 */
pupilDataService.find = async function (options) {
  winston.warn('*** pupilDataService.find is deprecated ***')
  return Pupil.find(options).lean().exec()
}

/**
 * Generalised update function - can update many in one transaction
 * @deprecated - use sqlUpdate instead
 * @param query
 * @param criteria
 * @return {Promise}
 */
pupilDataService.update = async function (query, criteria, options = {multi: false}) {
  winston.warn('*** pupilDataService.update is deprecated ***')
  return Pupil.update(query, criteria, options).exec()
}

/**
 * @deprecated - use sql* methods instead
 * @param pupils
 * @return {Promise<Array>}
 */
pupilDataService.updateMultiple = async function (pupils) {
  winston.warn('*** pupilDataService.updateMultiple is deprecated ***')
  // returns Promise
  let savedPupils = []
  await Promise.all(pupils.map(p => Pupil.updateOne({ '_id': p._id }, p)))
    .then(results => {
      // all pupils saved ok
      savedPupils = results
    },
    error => { throw new Error(error) }
  )
  return savedPupils
}

/**
 * Create a new Pupil
 * @deprecated use sqlCreate instead
 * @param data
 * @return {Promise}
 */
pupilDataService.save = async function (data) {
  winston.warn('*** pupilDataService.save is deprecated ***')
  const pupil = new Pupil(data)
  await pupil.save()
  return pupil.toObject()
}

/**
 * Unset the attendance code for a single pupil
 * @deprecated use attendanceCodeDataService.unsetAttendanceCode instead
 * @param id
 * @return {Promise<*>}
 */
pupilDataService.unsetAttendanceCode = async function (id) {
  winston.warn('*** pupilDataService.unsetAttendanceCode is deprecated ***')
  return Pupil.update({ _id: id }, { $unset: { attendanceCode: true } })
}

/**
 * Get all the restart codes documents
 * @deprecated - moved to a lookup table
 * @return {Promise.<{Object}>}
 */
pupilDataService.getStatusCodes = async () => {
  winston.warn('*** pupilDataService.getStatusCodes is deprecated ***')
  return PupilStatusCode.find().lean().exec()
}

/** SQL METHODS */

/**
 * Fetch all pupils for a school by dfeNumber sorted by specific column
 * @param {number} dfeNumber
 * @param sortDirection
 * @param sortBy
 * @return {Promise<results>}
 */
pupilDataService.sqlFindPupilsByDfeNumber = async function (dfeNumber, sortDirection, sortBy) {
  const paramDfeNumber = { name: 'dfeNumber', type: TYPES.Int, value: dfeNumber }
  sortDirection = sortDirection !== 'asc' ? 'desc' : 'asc'
  switch (sortBy) {
    case 'lastName':
      sortBy = 'lastName'
      break
    default:
      // anything else should default to last name
      sortBy = 'lastName'
  }
  const sql = `
      SELECT 
        p.*    
      FROM ${sqlService.adminSchema}.${table} p 
      INNER JOIN school s ON s.id = p.school_id
      WHERE s.dfeNumber = @dfeNumber
      ORDER BY ${sortBy} ${sortDirection}      
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
  const paramPupilPin = { name: 'pin', type: TYPES.Int, value: pin }
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
  winston.debug('sqlFindPupilsWithActivePins: called with [${dfeNumber]')
  const paramDfeNumber = { name: 'dfeNumber', type: TYPES.Int, value: dfeNumber }
  const sql = `
  SELECT p.*
  FROM ${sqlService.adminSchema}.${table} p INNER JOIN ${sqlService.adminSchema}.[school] s
    ON p.school_id = s.id
  WHERE p.pin IS NOT NULL
  AND s.dfeNumber = @dfeNumber
  AND p.pinExpiresAt IS NOT NULL
  AND p.pinExpiresAt > GETUTCDATE()
  ORDER BY p.lastName ASC, p.foreName ASC
  `
  return sqlService.query(sql, [paramDfeNumber])
}

/**
 * Find pupils using urlSlugs
 * @param {Array|string} slugs
 * @return {Promise<*>}
 */
pupilDataService.sqlFindPupilsByUrlSlug = async (slugs) => {
  if (!Array.isArray(slugs) && slugs.length > 0) {
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
  let sql = `
      SELECT *    
      FROM ${sqlService.adminSchema}.${table}
      `
  let whereClause = ' WHERE id IN ('
  const params = []
  for (let index = 0; index < ids.length; index++) {
    whereClause = whereClause + `@p${index}`
    if (index < ids.length - 1) {
      whereClause += ','
    }
    params.push({
      name: `p${index}`,
      value: ids[index],
      type: TYPES.Int
    })
  }
  whereClause = `${whereClause})`
  sql = sql + whereClause + ' ORDER BY lastName'
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
      type: TYPES.SmallInt
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
    sqlSort = `p.lastName ${sortDirection}, p.foreName ${sortDirection}`
  } else if (sortField === 'reason') {
    sqlSort = `ac.reason ${sortDirection}`
  }
  const params = [
    { name: 'dfeNumber', type: TYPES.Int, value: dfeNumber }
  ]
  // The order by clause is to sort nulls last
  const sql = `
  SELECT p.*, ac.reason
  FROM ${sqlService.adminSchema}.${table} p 
    INNER JOIN ${sqlService.adminSchema}.[school] s ON p.school_id = s.id
    LEFT OUTER JOIN ${sqlService.adminSchema}.[pupilAttendance] pa ON p.id = pa.pupil_id 
    LEFT OUTER JOIN ${sqlService.adminSchema}.[attendanceCode] ac ON pa.attendanceCode_id = ac.id
  WHERE s.dfeNumber = @dfeNumber
  ORDER BY CASE WHEN ac.reason IS NULL THEN 1 ELSE 0 END, ${sqlSort}
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
  const res = await sqlService.modify(sql, params)
  // E.g. { insertId: [1, 2], rowsModified: 4 }
  return res
}

module.exports = pupilDataService
