'use strict'

const config = require('../../../config')

const createAzureUser = `CREATE USER ${config.Sql.TechSupport.Username} WITH PASSWORD ='${config.Sql.TechSupport.Password}', DEFAULT_SCHEMA=[mtc_admin];`

const createLocalSqlUser = `CREATE LOGIN ${config.Sql.TechSupport.Username} WITH PASSWORD = '${config.Sql.TechSupport.Password}'; USE ${config.Sql.Database}; CREATE USER ${config.Sql.TechSupport.Username} FOR LOGIN ${config.Sql.TechSupport.Username} WITH DEFAULT_SCHEMA = [mtc_admin];`

module.exports.generateSql = function () {
  if (config.Sql.Azure.Scale) {
    return createAzureUser
  } else {
    return createLocalSqlUser
  }
}
