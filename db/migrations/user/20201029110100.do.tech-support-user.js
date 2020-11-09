'use strict'

const config = require('../../config')

const createStatementSqlAzure = `CREATE USER ${config.Sql.TechSupport.Username} WITH PASSWORD ='${config.Sql.TechSupport.Password}', DEFAULT_SCHEMA=[mtc_admin];`
const createStatementSqlServer = `CREATE LOGIN ${config.Sql.TechSupport.Username} WITH PASSWORD = '${config.Sql.TechSupport.Password}'; USE ${config.Sql.Database}; CREATE USER ${config.Sql.TechSupport.Username} FOR LOGIN ${config.Sql.TechSupport.Username} WITH DEFAULT_SCHEMA = [mtc_admin];`

module.exports.generateSql = function () {
  if (config.Sql.Azure.Scale) {
    return createStatementSqlAzure
  } else {
    return createStatementSqlServer
  }
}
