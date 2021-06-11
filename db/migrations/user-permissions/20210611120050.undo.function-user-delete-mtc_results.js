'use strict'

const config = require('../../config')
module.exports.generateSql = function () {
  return `REVOKE DELETE ON SCHEMA::[mtc_results] TO [${config.Sql.FunctionsApp.Username}] AS [dbo];`
}
