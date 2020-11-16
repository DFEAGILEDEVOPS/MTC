'use strict'

const config = require('../../config')

const createStatementSqlAzure = `CREATE USER ${config.Sql.FunctionsApp.Username} WITH PASSWORD ='${config.Sql.FunctionsApp.Password}', DEFAULT_SCHEMA=[mtc_admin];`
const createStatementSqlServer = `CREATE LOGIN ${config.Sql.FunctionsApp.Username} WITH PASSWORD = '${config.Sql.FunctionsApp.Password}'; USE ${config.Sql.Database}; CREATE USER ${config.Sql.FunctionsApp.Username} FOR LOGIN ${config.Sql.FunctionsApp.Username} WITH DEFAULT_SCHEMA = [mtc_admin];`

module.exports.generateSql = function () {
  if (config.Sql.Azure.Scale) {
    return createStatementSqlAzure
  } else {
    return createStatementSqlServer
  }
}
