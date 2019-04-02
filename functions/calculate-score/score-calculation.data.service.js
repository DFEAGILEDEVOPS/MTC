const sqlService = require('../lib/sql/sql.service')
const { TYPES } = sqlService

/**
 * Execute store score calculation store procedure
 * @return {Promise<object>}
 */
module.exports.sqlExecuteScoreCalculationStoreProcedure = async (checkWindowId) => {
  const sql = `EXEC [mtc_admin].[spRefreshScoreData] @checkwindowId = @checkWindowId`
  const params = [
    {
      name: 'checkWindowId',
      value: checkWindowId,
      type: TYPES.Int
    }
  ]
  return sqlService.query(sql, params)
}
