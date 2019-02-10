const { TYPES } = require('tedious')
const sqlService = require('less-tedious')
const R = require('ramda')

const schema = '[mtc_admin]'
const checkWindowTable = '[checkWindow]'

/**
 * Find a check window within the score calculation period
 * @return {Object}
 */
module.exports.sqlFindCalculationPeriodCheckWindow = async () => {
  const sql = `
  SELECT * from ${schema}.${checkWindowTable}
  WHERE GETUTCDATE() >= checkStartDate AND GETUTCDATE() <= adminEndDate 
  )`
  const res = await sqlService.query(sql)
  return R.head(res)
}

/**
 * Fetch school average scores for active check window
 * @return {Promise<Array>}
 */
module.exports.sqlFindCheckWindowSchoolAverageScores = async () => {
  const sql = `SELECT * FROM ${schema}.[vewSchoolsAverage]`
  return sqlService.query(sql)
}

/**
 * Save school scores for check window id
 * @param {Number} checkWindowId
 * @param {Array} schoolsWithScores
 * @return {Promise<Array>}
 */
module.exports.sqlInsertSchoolScores = async (checkWindowId, schoolsWithScores) => {
  const params = []
  const queries = []

  params.push({
    name: `checkWindowId`,
    value: checkWindowId,
    type: TYPES.Int
  })
  queries.push(`DELETE ss 
    FROM ${schema}.[schoolScore] ss
    WHERE ss.checkWindow_id = @checkWindowId
  `)

  const inserts = []
  schoolsWithScores.forEach((ss, idx) => {
    inserts.push(`(@checkWindow_id${idx}, @school_id${idx}, score${idx})`)
    params.push({
      name: `checkWindow_id${idx}`,
      value: checkWindowId,
      type: TYPES.Int
    })
    params.push({
      name: `school_id${idx}`,
      value: ss['school_id'],
      type: TYPES.Int
    })
    params.push({
      name: `score${idx}`,
      value: ss['score'],
      type: TYPES.Decimal
    })
  })
  const insertSql = `INSERT INTO ${sqlService.adminSchema}.[schoolScore] (
    checkWindow_id,
    school_id,
    score
    ) VALUES`

  queries.push([insertSql, inserts.join(', \n')].join(' '))
  const sql = queries.join('\n')
  return sqlService.modifyWithTransaction(sql, params)
}
