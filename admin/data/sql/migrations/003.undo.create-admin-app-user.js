'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  return `DROP USER IF EXISTS ${config.Sql.Application.Username};`
}

const dropAzureUser = `DROP USER IF EXISTS ${config.Sql.Application.Username};`

const dropLocalSqlUser = `DROP USER ${config.Sql.Application.Username}; DROP LOGIN ${config.Sql.Application.Username};`

module.exports.generateSql = function () {
  if (config.Sql.Azure.Scale) {
    return dropAzureUser
  } else {
    return dropLocalSqlUser
  }
}
