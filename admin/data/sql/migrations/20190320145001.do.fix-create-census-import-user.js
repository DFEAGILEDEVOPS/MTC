'use strict'

const config = require('../../../config')

const createAzureUser = `CREATE USER ${config.Sql.PupilCensus.Username} WITH PASSWORD ='${config.Sql.PupilCensus.Password}', DEFAULT_SCHEMA=[mtc_admin];`
const createLocalUser = `CREATE LOGIN ${config.Sql.PupilCensus.Username} WITH PASSWORD = '${config.Sql.PupilCensus.Password}'; USE ${config.Sql.Database}; CREATE USER ${config.Sql.PupilCensus.Username} FOR LOGIN ${config.Sql.PupilCensus.Username} WITH DEFAULT_SCHEMA = [mtc_admin];`

// TODO test on sql azure
module.exports.generateSql = function () {
  if (!config.Sql.PupilCensus.Username) {
    throw new Error('Missing \'config.Sql.PupilCensus.Username\'')
  }
  if (!config.Sql.PupilCensus.Password) {
    throw new Error('Missing \'config.Sql.PupilCensus.Password\'')
  }
  if (config.Sql.Azure.Scale) {
    return createAzureUser
  } else {
    return createLocalUser
  }
}
