'use strict'
const config = require('../../config')

module.exports.generateSql = function () {
  return `REVOKE SELECT ON OBJECT::mtc_results.checkResult TO [${config.Sql.Application.Username}] AS [dbo];`
}
