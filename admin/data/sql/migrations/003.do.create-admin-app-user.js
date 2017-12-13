'use strict'

const createAzureUser = `CREATE USER mtcAdminUser WITH PASSWORD ='${process.env.SQL_APP_USER_PASSWORD}', DEFAULT_SCHEMA=[mtc_admin];`

const createLocalSqlUser = `CREATE LOGIN mtcAdminUser WITH PASSWORD = '${process.env.SQL_APP_USER_PASSWORD}'; USE ${process.env.SQL_DATABASE}; CREATE USER mtcAdminUser FOR LOGIN mtcAdminUser WITH DEFAULT_SCHEMA = [mtc_admin];`

// TODO test on sql azure
module.exports.generateSql = function () {
  if (process.env.SQL_SCALE) {
    return createAzureUser
  } else {
    return createLocalSqlUser
  }
}
