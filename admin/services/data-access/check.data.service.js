'use strict'

const R = require('ramda')

const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES
const table = '[check]'

const checkDataService = {}

/**
 * Find a Check by its checkCode UUID
 * @param checkCode *
 * @return {Promise}
 */
checkDataService.sqlFindOneByCheckCode = async function (checkCode) {
  const params = [
    {
      name: 'checkCode',
      value: checkCode,
      type: TYPES.UniqueIdentifier
    }
  ]
  const result = await sqlService.query(`SELECT * FROM ${sqlService.adminSchema}.[check] WHERE checkCode=@checkCode`, params)
  return R.head(result)
}

/**
 * Find latest check for pupil
 * @param pupilId - the pupil taking the check
 * @param started - if true returns latest started check only
 * @return {Promise.<void>} - lean Check objects
 */
checkDataService.sqlFindLatestCheck = async function (pupilId, started) {
  let sql = `SELECT * FROM ${sqlService.adminSchema}.[check] WHERE pupil_id = @pupilId`
  if (started) {
    sql = sql + ' AND startedAt IS NOT NULL'
  }
  const params = [
    {
      name: 'pupilId',
      value: pupilId,
      type: TYPES.Int
    }
  ]
  return sqlService.query(sql, params)
}

/**
 * Find Checks and associated data by checkCode
 * @param checkCodes - array of UUID
 * @return {Promise.<void>} - lean Check objects, fully populated
 * This includes the pupil (includes the school), checkWindow, and checkForm.  This is fairly efficient
 * involving 1 extra query per document set per sub-document.
 */
checkDataService.sqlFindFullyPopulated = async function (checkCodes) {
  let sql = `SELECT * FROM ${sqlService.adminSchema}.[check] chk INNER JOIN ${sqlService.adminSchema}.pupil pup ON pup.id = chk.pupil_id
   INNER JOIN ${sqlService.adminSchema}.school sch ON sch.id = pup.school_id
   INNER JOIN ${sqlService.adminSchema}.checkWindow wdw ON wdw.id = chk.checkWindow_id
   INNER JOIN ${sqlService.adminSchema}.checkForm frm ON frm.id = chk.checkForm_id`
  let whereClause = ' WHERE chk.checkCode IN ('
  const params = []
  for (let index = 0; index < checkCodes.length; index++) {
    whereClause = whereClause + `@p${index}`
    if (index < checkCodes.length - 1) {
      whereClause += ','
    }
    params.push({
      name: `p${index}`,
      value: checkCodes[index],
      type: TYPES.UniqueIdentifier
    })
  }
  whereClause = whereClause + ')'
  sql = sql + whereClause
  return sqlService.query(sql, params)
}

/**
 * replaces mongo count implementation
 * returns number of checks started by specified pupil
 * @param pupilId
 * @return {Promise.<*>}
 */
checkDataService.sqlFindNumberOfChecksStartedByPupil = async function (pupilId) {
  const sql = `
  SELECT COUNT(*) AS [cnt] FROM ${sqlService.adminSchema}.[check]
  WHERE pupil_id=@pupilId 
  AND startedAt IS NOT NULL
  AND DATEDIFF(day, createdAt, GETUTCDATE()) = 0`
  const params = [
    {
      name: 'pupilId',
      value: pupilId,
      type: TYPES.Int
    }
  ]
  const result = await sqlService.query(sql, params)
  const obj = R.head(result)
  return R.prop('cnt', obj)
}

checkDataService.sqlUpdateCheckStartedAt = async (checkCode, startedAt) => {
  const sql = `UPDATE ${sqlService.adminSchema}.[check] SET startedAt=@startedAt WHERE checkCode=@checkCode AND startedAt IS NULL`
  const params = [
    {
      name: 'startedAt',
      value: startedAt,
      type: TYPES.DateTimeOffset
    },
    {
      name: 'checkCode',
      value: checkCode,
      type: TYPES.UniqueIdentifier
    }
  ]
  return sqlService.modify(sql, params)
}

checkDataService.sqlUpdateCheckWithResults = async (checkCode, mark, maxMark, markedAt) => {
  const sql = `UPDATE ${sqlService.adminSchema}.[check] 
  SET mark=@mark, 
  maxMark=@maxMark, 
  markedAt=@markedAt 
  WHERE checkCode=@checkCode`

  const params = [
    {
      name: 'checkCode',
      value: checkCode,
      type: TYPES.UniqueIdentifier
    },
    {
      name: 'mark',
      value: mark,
      type: TYPES.TinyInt
    },
    {
      name: 'maxMark',
      value: maxMark,
      type: TYPES.TinyInt
    },
    {
      name: 'markedAt',
      value: markedAt,
      type: TYPES.DateTimeOffset
    }
  ]
  return sqlService.modify(sql, params)
}

/**
 * Create a new Check
 * @param check
 * @return {Promise}
 */
checkDataService.sqlCreate = async function (check) {
  return sqlService.create('[check]', check)
}

/**
 * Find the latest check for pupil that is flagged as not started
 * @param pupilId - the pupil taking the check
 * @return {Promise.<void>} - lean Check objects
 */
checkDataService.sqlFindLastCheckByPupilId = async function (pupilId) {
  const sql = `SELECT TOP 1 * FROM ${sqlService.adminSchema}.[check] WHERE pupil_id = @pupilId
    AND startedAt IS NULL ORDER BY createdAt DESC`

  const params = [
    {
      name: 'pupilId',
      value: pupilId,
      type: TYPES.Int
    }
  ]
  const result = await sqlService.query(sql, params)
  return R.head(result)
}

/**
 * Find the latest started check for pupil
 * @param pupilId - the pupil taking the check
 * @return {Promise.<void>} - lean Check objects
 */
checkDataService.sqlFindLastStartedCheckByPupilId = async function (pupilId) {
  const sql = `SELECT TOP 1 * FROM ${sqlService.adminSchema}.[check] WHERE pupil_id = @pupilId
    AND startedAt IS NOT NULL ORDER BY startedAt DESC`

  const params = [
    {
      name: 'pupilId',
      value: pupilId,
      type: TYPES.Int
    }
  ]
  const result = await sqlService.query(sql, params)
  return R.head(result)
}

/**
 * Create minimal multiple new checks
 * @param checks
 * @return {Promise}
 */
checkDataService.sqlCreateBatch = async function (checks) {
  const insert = `INSERT INTO ${sqlService.adminSchema}.${table} (
    pupil_id,
    checkWindow_id,
    checkForm_id
  )  VALUES`

  const params = []
  const insertClauses = []

  checks.forEach((c, i) => {
    params.push({name: `pupil_id${i}`, value: c.pupil_id, type: TYPES.Int})
    params.push({name: `checkWindow_id${i}`, value: c.checkWindow_id, type: TYPES.Int})
    params.push({name: `checkForm_id${i}`, value: c.checkForm_id, type: TYPES.Int})
    insertClauses.push(`(@pupil_id${i}, @checkWindow_id${i}, @checkForm_id${i})`)
  })

  const sql = [insert, insertClauses.join(', ')].join(' ')
  return sqlService.modify(sql, params)
}

/**
 * Retrieve the latest check during pupil authentication from the pupil app.
 * @param pupilId
 * @return {Promise<void>}
 */
checkDataService.sqlFindOneForPupilLogin = async function (pupilId) {
  const sql = `
  SELECT TOP 1 * 
  FROM ${sqlService.adminSchema}.${table}
  WHERE data IS NULL 
  AND startedAt IS NULL
  AND pupil_id = @pupilId
  ORDER BY createdAt DESC 
  `
  const params = [{name: 'pupilId', value: pupilId, type: TYPES.Int}]
  const result = await sqlService.query(sql, params)
  return R.head(result)
}

/**
 * Update: pass in an object with the id and the modified fields
 * @param checkData
 * @return {Promise<*>}
 */
checkDataService.sqlUpdate = async function (checkData) {
  return sqlService.update('[check]', checkData)
}

checkDataService.sqlFindAllFormsUsedByPupils = async function (pupilIds) {
  const select = `SELECT 
    f.id,
    f.name,
    c.pupil_id     
  FROM ${sqlService.adminSchema}.${table} c INNER JOIN
    ${sqlService.adminSchema}.[checkForm] f ON c.checkForm_id = f.id
  WHERE
    f.isDeleted <> 1  
  `
  const where = sqlService.buildParameterList(pupilIds, TYPES.Int)
  const andClause = 'AND pupil_id IN (' + where.paramIdentifiers.join(', ') + ')'
  const sql = [select, andClause].join(' ')
  const results = await sqlService.query(sql, where.params)
  const byPupil = {}
  results.forEach(x => {
    if (byPupil[x.pupil_id]) {
      byPupil[x.pupil_id].push(x)
    } else {
      byPupil[x.pupil_id] = [x]
    }
  })
  return byPupil
}

/**
 * Find all the checks that have not been processed
 * @returns {Boolean}
 */
checkDataService.sqlHasUnprocessed = async function () {
  const sql = `SELECT TOP 1 *
  FROM ${sqlService.adminSchema}.${table} chk
    LEFT JOIN ${sqlService.adminSchema}.psychometricianReportCache prc
      ON chk.id = prc.check_id
      WHERE prc.check_id IS NULL`

  const result = await sqlService.query(sql, [])
  return result.length > 0
}

/**
 * Returns an array of Ids: [1234, 5678, ...] of checks.  Used by the batch processor.
 * @param batchSize the size of the batch to work with
 * @returns {Array}
 */
checkDataService.sqlFindUnprocessed = async function (batchSize) {
  if (!batchSize) {
    throw new Error('Missing argument: batchSize')
  }
  const safeBatchSize = parseInt(batchSize, 10)

  const sql = `SELECT TOP ${safeBatchSize} chk.id 
  FROM ${sqlService.adminSchema}.${table} chk
    LEFT JOIN ${sqlService.adminSchema}.psychometricianReportCache prc
      ON chk.id = prc.check_id
      WHERE prc.check_id IS NULL`
  const results = await sqlService.query(sql)
  return results.map(r => r.id)
}

module.exports = checkDataService
