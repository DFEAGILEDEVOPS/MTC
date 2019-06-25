const sqlService = require('../lib/sql/sql.service')
const { TYPES } = sqlService

/**
 * Execute store schools scores store procedure
 * @return {Promise<object>}
 */
module.exports.sqlExecuteStoreSchoolScoresStoreProcedure = async (checkWindowId) => {
  const sql = `EXEC [mtc_admin].[spStorePupilsResults] @checkwindowId = @checkWindowId`
  const params = [
    {
      name: 'checkWindowId',
      value: checkWindowId,
      type: TYPES.Int
    }
  ]
  return sqlService.query(sql, params)
}
