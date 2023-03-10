'use strict'

const config = require('../../config')

const createStatementSqlAzure = `IF USER_ID('${config.Sql.SqlSupport.Username}') IS NOT NULL RETURN; CREATE USER ${config.Sql.SqlSupport.Username} WITH PASSWORD ='${config.Sql.SqlSupport.Password}', DEFAULT_SCHEMA=[mtc_admin];`
const createStatementSqlServer = `IF SUSER_ID('${config.Sql.SqlSupport.Username}') IS NOT NULL RETURN; CREATE LOGIN ${config.Sql.SqlSupport.Username} WITH PASSWORD = '${config.Sql.SqlSupport.Password}'; USE ${config.Sql.Database}; IF USER_ID('${config.Sql.SqlSupport.Username}') IS NOT NULL RETURN; CREATE USER ${config.Sql.SqlSupport.Username} FOR LOGIN ${config.Sql.SqlSupport.Username} WITH DEFAULT_SCHEMA = [mtc_admin];`

module.exports.generateSql = function () {
  // only create if password is configured
  if (config.Sql.SqlSupport.Password === undefined) return ''
  if (config.Sql.Azure.Scale) {
    return createStatementSqlAzure
  } else {
    return createStatementSqlServer
  }
}
