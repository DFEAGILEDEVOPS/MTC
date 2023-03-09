'use strict'

const config = require('../../config')

module.exports.generateSql = function () {
  return `
    REVOKE CONNECT TO [${config.Sql.FunctionsApp.Username}] AS [dbo]
    REVOKE EXECUTE,SELECT ON SCHEMA::[mtc_admin] TO [${config.Sql.FunctionsApp.Username}] AS [dbo]
    REVOKE EXECUTE,SELECT ON SCHEMA::[mtc_results] TO [${config.Sql.FunctionsApp.Username}] AS [dbo]
  `
}
