'use strict'

const config = require('../../config')

const createStatementSqlAzure = `CREATE USER ${config.Sql.Application.Username} WITH PASSWORD ='${config.Sql.Application.Password}', DEFAULT_SCHEMA=[mtc_admin];`
const createStatementSqlServer = `CREATE LOGIN ${config.Sql.Application.Username} WITH PASSWORD = '${config.Sql.Application.Password}'; USE ${config.Sql.Database}; CREATE USER ${config.Sql.Application.Username} FOR LOGIN ${config.Sql.Application.Username} WITH DEFAULT_SCHEMA = [mtc_admin];`

module.exports.generateSql = function () {
  if (config.Sql.Azure.Scale) {
    return createStatementSqlAzure
  } else {
    return createStatementSqlServer
  }
}
