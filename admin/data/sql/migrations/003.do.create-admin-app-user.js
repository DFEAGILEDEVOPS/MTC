'use strict'

module.exports.generateSql = function () {
  return `CREATE USER mtcAdminUser WITH PASSWORD ='${process.env.SQL_APP_USER_PASSWORD}', DEFAULT_SCHEMA=[mtc];`
}
