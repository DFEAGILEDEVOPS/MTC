'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  return `REVOKE UPDATE on OBJECT::[mtc_results].[checkResult] to [${config.Sql.FunctionsApp.Username}];`
}
