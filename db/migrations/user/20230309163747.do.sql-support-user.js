'use strict'

const config = require('../../config')

const createStatementSqlAzure = `CREATE USER ${config.Sql.SqlSupport.Username} WITH PASSWORD ='${config.Sql.SqlSupport.Password}', DEFAULT_SCHEMA=[mtc_admin];`
const createStatementSqlServer = `CREATE LOGIN ${config.Sql.SqlSupport.Username} WITH PASSWORD = '${config.Sql.SqlSupport.Password}'; USE ${config.Sql.Database}; CREATE USER ${config.Sql.SqlSupport.Username} FOR LOGIN ${config.Sql.SqlSupport.Username} WITH DEFAULT_SCHEMA = [mtc_admin];`

module.exports.generateSql = function () {
  if (config.Sql.Azure.Scale) {
    return createStatementSqlAzure
  } else {
    return createStatementSqlServer
  }
}
