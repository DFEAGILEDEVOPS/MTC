const R = require('ramda')
const sqlService = require('../lib/sql/sql.service')

/**
 * Get all school ids
 * @return {Promise<object>}
 */
module.exports.sqlFindSchoolIds = async () => {
  const sql = `SELECT id FROM [mtc_admin].[school]`
  const params = []
  const result = await sqlService.query(sql, params)
  return R.map(i => i.id, result)
}
