'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  return `   
    -- CREATE SCHEMA [mtc_census_import];
    -- GO       
    GRANT UPDATE,INSERT ON [mtc_admin].[school] TO [${config.Sql.PupilCensus.Username}];
    `
}
