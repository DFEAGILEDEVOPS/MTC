'use strict'

const config = require('../../config')

const dropAzureUser = `DROP USER IF EXISTS ${config.Sql.FunctionsApp.Username};`
const dropLocalUser = `DROP USER ${config.Sql.FunctionsApp.Username}; DROP LOGIN ${config.Sql.FunctionsApp.Username};`
// TODO rollback server principal also
module.exports.generateSql = function () {
  if (config.Sql.Azure.Scale) {
    return dropAzureUser
  } else {
    return dropLocalUser
  }
}
