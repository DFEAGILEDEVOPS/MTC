const sqlService = require('../lib/sql/sql.service')
const { TYPES } = sqlService

/**
 * Insert school result data into pupilResultsDiagnosticCache
 * @param {Number} schoolId
 * @param {Object} rawPayload
 * @return {Promise<object>}
 */
module.exports.sqlInsert = async (schoolId, rawPayload) => {
  const payload = JSON.stringify(rawPayload)
  const sql = `
    INSERT INTO [mtc_admin].[pupilResultsDiagnosticCache] (school_id, payload)
        VALUES (@schoolId, @payload)
  `
  const params = [
    {
      name: 'schoolId',
      value: schoolId,
      type: TYPES.Int
    },
    {
      name: 'payload',
      value: payload,
      type: TYPES.NVarChar
    }
  ]
  return sqlService.query(sql, params)
}

/**
 * Delete pupilResultsDiagnosticCache table data
 * @return {Promise<object>}
 */
module.exports.sqlDelete = async () => {
  const sql = `DELETE FROM [mtc_admin].pupilResultsDiagnosticCache`
  const params = []
  return sqlService.query(sql, params)
}
