'use strict'

const config = require('../../config')

const dropAzureUser = `DROP USER IF EXISTS ${config.Sql.SqlSupport.Username};`
const dropLocalUser = `
  IF USER_ID('${config.Sql.SqlSupport.Username}') IS NULL RETURN;
  DROP USER ${config.Sql.SqlSupport.Username};
  IF SUSER_ID('${config.Sql.SqlSupport.Username}') IS NULL RETURN;
  DROP LOGIN ${config.Sql.SqlSupport.Username};`

module.exports.generateSql = function () {
  // always try to undo, as password may have been removed/added between migrations
  if (config.Sql.Azure.Scale) {
    return dropAzureUser
  } else {
    return dropLocalUser
  }
}
