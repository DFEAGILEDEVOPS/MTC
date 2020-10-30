'use strict'

const config = require('../../config')

const dropAzureUser = `DROP USER IF EXISTS ${config.Sql.Application.Username};`
const dropLocalUser = `DROP USER ${config.Sql.Application.Username}; DROP LOGIN ${config.Sql.Application.Username};`
// TODO rollback server principal also
module.exports.generateSql = function () {
  if (config.Sql.Azure.Scale) {
    return dropAzureUser
  } else {
    return dropLocalUser
  }
}
