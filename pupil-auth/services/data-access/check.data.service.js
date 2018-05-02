'use strict'

const R = require('ramda')

const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES
const table = '[check]'

const checkDataService = {}
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

module.exports = checkDataService
