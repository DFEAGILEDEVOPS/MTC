'use strict'

const config = require('../../config')

module.exports.generateSql = function () {
  if (config.Sql.SqlSupport.Password === undefined) return ''
  return `
    IF USER_ID('${config.Sql.SqlSupport.Username}') IS NULL RETURN
    GRANT CONNECT TO [${config.Sql.SqlSupport.Username}] AS [dbo]
    GRANT EXECUTE,SELECT ON SCHEMA::[mtc_admin] TO [${config.Sql.SqlSupport.Username}] AS [dbo]
    GRANT EXECUTE,SELECT ON SCHEMA::[mtc_results] TO [${config.Sql.SqlSupport.Username}] AS [dbo]
  `
}
