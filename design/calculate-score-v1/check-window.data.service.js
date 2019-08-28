const sqlService = require('../../functions/lib/sql/sql.service')
const { TYPES } = sqlService
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
  WHERE GETUTCDATE() BETWEEN checkStartDate AND adminEndDate
  AND isDeleted = 0
  `
  const res = await sqlService.query(sql)
  return R.head(res)
}

/**
 * Mark check window as complete
 * @param {Number} checkWindowId
 * @return {Promise<*>}
 */
module.exports.sqlMarkCheckWindowAsComplete = async (checkWindowId) => {
  const params = [{
    name: 'checkWindowId',
    value: checkWindowId,
    type: TYPES.Int
  }]
  const sql = `
  UPDATE ${schema}.${checkWindowTable}
  SET complete = 1
  WHERE id = @checkWindowId`
  return sqlService.modify(sql, params)
}
