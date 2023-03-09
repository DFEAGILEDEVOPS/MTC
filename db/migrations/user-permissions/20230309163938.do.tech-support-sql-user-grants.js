'use strict'

const config = require('../../config')

module.exports.generateSql = function () {
  return `
    GRANT CONNECT TO [${config.Sql.SqlSupport.Username}] AS [dbo]
    GRANT EXECUTE,SELECT ON SCHEMA::[mtc_admin] TO [${config.Sql.SqlSupport.Username}] AS [dbo]
    GRANT EXECUTE,SELECT ON SCHEMA::[mtc_results] TO [${config.Sql.SqlSupport.Username}] AS [dbo]
  `
}
