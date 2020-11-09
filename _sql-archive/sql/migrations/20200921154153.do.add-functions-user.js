const config = require('../../../config')

const createAzureUser = `CREATE USER ${config.Sql.FunctionsApp.Username} WITH PASSWORD ='${config.Sql.FunctionsApp.Password}', DEFAULT_SCHEMA=[mtc_admin];`

const createLocalSqlUser = `CREATE LOGIN ${config.Sql.FunctionsApp.Username} WITH PASSWORD = '${config.Sql.FunctionsApp.Password}'; USE ${config.Sql.Database}; CREATE USER ${config.Sql.FunctionsApp.Username} FOR LOGIN ${config.Sql.FunctionsApp.Username} WITH DEFAULT_SCHEMA = [mtc_admin];`

module.exports.generateSql = function () {
  if (config.Sql.Azure.Scale) {
    return createAzureUser
  } else {
    return createLocalSqlUser
  }
}
