'use strict'

const config = require('../../config')

const dropAzureUser = `DROP USER IF EXISTS ${config.Sql.SqlSupport.Username};`
const dropLocalUser = `DROP USER ${config.Sql.SqlSupport.Username}; DROP LOGIN ${config.Sql.SqlSupport.Username};`

module.exports.generateSql = function () {
  if (config.Sql.Azure.Scale) {
    return dropAzureUser
  } else {
    return dropLocalUser
  }
}
