'use strict'

module.exports.generateSql = function () {
  // TODO feels completely wrong storing this in application at runtime
  // should we use ARM templates to create database and user first?
  return `CREATE USER mtcAdminUser WITH PASSWORD ='${process.env.SQL_MTC_ADMIN_USER_PASSWORD}';`
}
