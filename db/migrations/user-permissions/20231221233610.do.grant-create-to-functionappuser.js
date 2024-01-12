'use strict'

const config = require('../../config')
module.exports.generateSql = function () {
  const statements = [
    `GRANT CONTROL ON DATABASE :: [${config.Sql.Database}] TO [${config.Sql.FunctionsApp.Username}];`,
    ` -- GRANT ALTER on schema::mtc_results to [${config.Sql.FunctionsApp.Username}];`,
    `  -- GRANT INSERT on schema::mtc_results to [${config.Sql.FunctionsApp.Username}];`
  ]

  // If we are on SQL Azure and not Linux then we need to grant BULK permissions
  if (config.Sql.Azure.Scale) {
    statements.push(`GRANT ADMINISTER DATABASE BULK OPERATIONS ON DATABASE :: [${config.Sql.Database}] TO [${config.Sql.FunctionsApp.Username}];`)
  }

  return statements.join('\n')
}
