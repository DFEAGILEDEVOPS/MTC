'use strict'

const config = require('../../../config')

const dropAzureUser = `DROP USER IF EXISTS ${config.Sql.PupilCensus.Username};`
const dropLocalUser = `DROP USER ${config.Sql.PupilCensus.Username}; DROP LOGIN ${config.Sql.PupilCensus.Username};`

// TODO test on sql azure
module.exports.generateSql = function () {
  if (config.Sql.Azure.Scale) {
    return dropAzureUser
  } else {
    return dropLocalUser
  }
}
