'use strict'
const config = require('../../config')

module.exports.generateSql = function () {
  return `REVOKE UPDATE ON OBJECT::mtc_results.checkResult TO [${config.Sql.FunctionsApp.Username}] AS [dbo];`
}
