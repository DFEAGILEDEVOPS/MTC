'use strict'

const config = require('../../config')

const dropAzureUser = `DROP USER IF EXISTS ${config.Sql.TechSupport.Username};`
const dropLocalUser = `DROP USER ${config.Sql.TechSupport.Username}; DROP LOGIN ${config.Sql.TechSupport.Username};`

module.exports.generateSql = function () {
  if (config.Sql.Azure.Scale) {
    return dropAzureUser
  } else {
    return dropLocalUser
  }
}
