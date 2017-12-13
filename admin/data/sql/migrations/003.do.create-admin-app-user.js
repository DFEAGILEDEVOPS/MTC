'use strict'

module.exports.generateX = function () {
  return `CREATE USER mtcAdminUser WITH PASSWORD ='${process.env.SQL_APP_USER_PASSWORD}', DEFAULT_SCHEMA=[mtc];`
}

module.exports.generateSql = function () {
  return `CREATE LOGIN mtcAdminUser WITH PASSWORD = '${process.env.SQL_APP_USER_PASSWORD}'; USE ${process.env.SQL_DATABASE}; CREATE USER mtcAdminUser FOR LOGIN mtcAdminUser WITH DEFAULT_SCHEMA = [mtc];`
}
