const sqlService = require('../lib/sql/sql.service')
const { TYPES } = sqlService

/**
 * Execute store schools scores store procedure
 * @param {Number} checkWindowId
 * @param {Number} schoolId
 * @return {Promise<object>}
 */
module.exports.sqlExecuteGetSchoolScores = async (checkWindowId, schoolId) => {
  const sql = `EXEC [mtc_admin].[spGetPupilsResults] @checkwindowId = @checkWindowId, @schoolId = @schoolId`
  const params = [
    {
      name: 'checkWindowId',
      value: checkWindowId,
      type: TYPES.Int
    },
    {
      name: 'schoolId',
      value: schoolId,
      type: TYPES.Int
    }
  ]
  return sqlService.query(sql, params)
}
