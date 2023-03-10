'use strict'

const config = require('../../config')

module.exports.generateSql = function () {
  return `
    IF USER_ID('${config.Sql.SqlSupport.Username}') IS NULL RETURN
    REVOKE CONNECT TO [${config.Sql.SqlSupport.Username}] AS [dbo]
    REVOKE EXECUTE,SELECT ON SCHEMA::[mtc_admin] TO [${config.Sql.SqlSupport.Username}] AS [dbo]
    REVOKE EXECUTE,SELECT ON SCHEMA::[mtc_results] TO [${config.Sql.SqlSupport.Username}] AS [dbo]
  `
}
