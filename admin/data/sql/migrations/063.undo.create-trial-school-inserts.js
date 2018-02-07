'use strict'

module.exports.generateSql = () => {
  const sql = []
  sql.push(`DELETE [mtc_admin].[pupil] WHERE lastName LIKE 'Trial-%`)
  sql.push(`DELETE [mtc_admin].[school] WHERE estabCode='FEB-TRIAL'`)
  return sql.join('\n')
}
