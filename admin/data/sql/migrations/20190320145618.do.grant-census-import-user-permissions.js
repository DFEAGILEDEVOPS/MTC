'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  return `
    CREATE SCHEMA [mtc_census_import];
    GO    
    GRANT CONTROL ON schema::[mtc_census_import] TO [${config.Sql.PupilCensus.Username}];
    GO
    GRANT CREATE TABLE TO [${config.Sql.PupilCensus.Username}];
    GO        
    GRANT UPDATE,INSERT ON [mtc_admin].[pupil] TO [${config.Sql.PupilCensus.Username}];    
    `
}
