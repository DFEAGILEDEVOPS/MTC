'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  return `
    GRANT CREATE TABLE TO [${config.Sql.FunctionsApp.Username}];
    GO
    GRANT CONTROL ON schema::[mtc_census_import] TO [${config.Sql.FunctionsApp.Username}];
    GO
    GRANT UPDATE,INSERT ON [mtc_admin].[pupil] TO [${config.Sql.FunctionsApp.Username}];
    GO
    GRANT SELECT,UPDATE,INSERT ON [mtc_admin].[school] TO [${config.Sql.FunctionsApp.Username}];
    GO
    GRANT UPDATE ON [mtc_admin].[job] TO [${config.Sql.FunctionsApp.Username}];
    GO
    GRANT SELECT ON [mtc_admin].[jobStatus] TO [${config.Sql.FunctionsApp.Username}];
    GO
    `
}
