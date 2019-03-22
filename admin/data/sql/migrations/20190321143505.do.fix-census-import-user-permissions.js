'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  return `
    REVOKE INSERT,UPDATE ON schema::[mtc_admin] TO [${config.Sql.PupilCensus.Username}];
    GO
    GRANT CREATE TABLE TO [${config.Sql.PupilCensus.Username}];
    GO
    CREATE SCHEMA [mtc_census_import];
    GO    
    GRANT CONTROL ON schema::[mtc_census_import] TO [${config.Sql.PupilCensus.Username}];
    GO    
    GRANT UPDATE,INSERT ON [mtc_admin].[pupil] TO [${config.Sql.PupilCensus.Username}];
    GO
    GRANT SELECT ON [mtc_admin].[school] TO [${config.Sql.PupilCensus.Username}];
    `
}
