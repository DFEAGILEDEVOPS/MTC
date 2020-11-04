'use strict'
const config = require('../../../config')

module.exports.generateSql = function () {
  return `REVOKE EXECUTE ON dbo.ufnCalcCheckStatusID TO [${config.Sql.Application.Username}]`
}
