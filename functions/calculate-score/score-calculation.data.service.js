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
 * Execute score calculation store procedure
 * @param checkWindowId
 * @return {Promise<object>}
 */
module.exports.sqlExecuteScoreCalculationStoreProcedure = async (checkWindowId) => {
  const sql = `EXEC ${schema}.[spCalculateScore] @checkwindowId = @checkWindowId`
  const params = [
    {
      name: 'checkWindowId',
      value: checkWindowId,
      type: TYPES.Int
    }
  ]
  return sqlService.query(sql, params)
}
