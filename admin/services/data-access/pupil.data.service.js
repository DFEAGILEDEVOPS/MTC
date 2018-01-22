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
 * @deprecated
 * @param schoolId
 * @param sortingField
 * @param sortingDirection
 * @returns {Array}
 */
pupilDataService.getSortedPupils = async (schoolId, sortingField, sortingDirection) => {
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

/**
 * Insert a list of pupils in the db
 * @param pupils
 * @return {Array}
 */
pupilDataService.insertMany = async (pupils) => {
  const mongoosePupils = pupils.map(p => new Pupil(p))
  const savedPupils = await Pupil.insertMany(mongoosePupils)
  return savedPupils
}

/**
 * Find a single pupil by criteria in `options`
 * @param options
 * @return {Promise.<{Object}>}
 */
pupilDataService.findOne = async function (options) {
  return Pupil.findOne(options).populate('school').lean().exec()
}

/**
 * Find and return non-lean pupils by criteria in `options`
 * @param options
 * @return {Promise.<{Object}>}
 */
pupilDataService.find = async function (options) {
  return Pupil.find(options).lean().exec()
}

/**
 * Generalised update function - can update many in one transaction
 * @param query
 * @param criteria
 * @return {Promise}
 */
pupilDataService.update = async function (query, criteria, options = {multi: false}) {
  return Pupil.update(query, criteria, options).exec()
}

/**
 * @param pupils
 * @return {Promise<Array>}
 */
pupilDataService.updateMultiple = async function (pupils) {
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
 * @deprecated
 * @param data
 * @return {Promise}
 */
pupilDataService.save = async function (data) {
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
  return Pupil.update({ _id: id }, { $unset: { attendanceCode: true } })
}

/**
 * Get all the restart codes documents
 * @return {Promise.<{Object}>}
 */
pupilDataService.getStatusCodes = async () => {
  return PupilStatusCode.find().lean().exec()
}

/** SQL METHODS */

/**
 * Fetch all pupils for a school by dfeNumber sorted by pupil name
 * @param {number} dfeNumber
 * @return {Promise<results>}
 */
pupilDataService.sqlFindPupilsByDfeNumber = async function (dfeNumber) {
  const paramDfeNumber = { name: 'dfeNumber', type: TYPES.Int, value: dfeNumber }
  const sql = `
      SELECT 
        p.*    
      FROM ${sqlService.adminSchema}.${table} p INNER JOIN school s ON s.id = p.school_id
      WHERE s.dfeNumber = @dfeNumber      
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

module.exports = pupilDataService
