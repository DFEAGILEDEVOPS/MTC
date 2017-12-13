'use strict'

const config = require('../../../config')

const createAzureUser = `CREATE USER mtcAdminUser WITH PASSWORD ='${config.Sql.Application.Username}', DEFAULT_SCHEMA=[mtc_admin];`

const createLocalSqlUser = `CREATE LOGIN mtcAdminUser WITH PASSWORD = '${config.Sql.Application.Password}'; USE ${config.Sql.Database}; CREATE USER mtcAdminUser FOR LOGIN mtcAdminUser WITH DEFAULT_SCHEMA = [mtc_admin];`

// TODO test on sql azure
module.exports.generateSql = function () {
  if (config.Sql.Azure.Scale) {
    return createAzureUser
  } else {
    return createLocalSqlUser
  }
}
