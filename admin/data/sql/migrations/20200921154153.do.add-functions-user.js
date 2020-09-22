const config = require('../../../config')

const createAzureUser = `CREATE USER ${config.Sql.ResultsSync.Username} WITH PASSWORD ='${config.Sql.ResultsSync.Password}', DEFAULT_SCHEMA=[mtc_results];`

const createLocalSqlUser = `CREATE LOGIN ${config.Sql.ResultsSync.Username} WITH PASSWORD = '${config.Sql.ResultsSync.Password}'; USE ${config.Sql.Database}; CREATE USER ${config.Sql.ResultsSync.Username} FOR LOGIN ${config.Sql.ResultsSync.Username} WITH DEFAULT_SCHEMA = [mtc_results];`

module.exports.generateSql = function () {
  if (config.Sql.Azure.Scale) {
    return createAzureUser
  } else {
    return createLocalSqlUser
  }
}
