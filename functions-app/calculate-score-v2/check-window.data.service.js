const sqlService = require('../lib/sql/sql.service')
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
  WHERE GETUTCDATE() BETWEEN checkStartDate AND adminEndDate`
  const res = await sqlService.query(sql)
  return R.head(res)
}
