'use strict'

const config = require('../../../config')

const dropAzureUser = `DROP USER IF EXISTS ${config.Sql.ResultsSync.Username};`

const dropLocalSqlUser = `DROP USER ${config.Sql.ResultsSync.Username}; DROP LOGIN ${config.Sql.ResultsSync.Username};`

module.exports.generateSql = function () {
  if (config.Sql.Azure.Scale) {
    return dropAzureUser
  } else {
    return dropLocalSqlUser
  }
}
