'use strict'

const config = require('../../../config')

const createAzureUser = `CREATE USER ${config.Sql.PupilCensus.Username} WITH PASSWORD ='${config.Sql.PupilCensus.Password}', DEFAULT_SCHEMA=[mtc_admin];`

// TODO test on sql azure
module.exports.generateSql = function () {
  if (config.Sql.Azure.Scale) {
    return createAzureUser
  } else {
    return ''
  }
}
