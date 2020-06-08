'use strict'

const config = require('../../../config')

const createAzureUser = `CREATE USER ${config.Sql.Application.Username} WITH PASSWORD ='${config.Sql.Application.Password}', DEFAULT_SCHEMA=[mtc_admin];`

const createLocalSqlUser = `CREATE LOGIN ${config.Sql.Application.Username} WITH PASSWORD = '${config.Sql.Application.Password}'; USE ${config.Sql.Database}; CREATE USER ${config.Sql.Application.Username} FOR LOGIN ${config.Sql.Application.Username} WITH DEFAULT_SCHEMA = [mtc_admin];`

module.exports.generateSql = function () {
  if (config.Sql.Azure.Scale) {
    return createAzureUser
  } else {
    return createLocalSqlUser
  }
}
