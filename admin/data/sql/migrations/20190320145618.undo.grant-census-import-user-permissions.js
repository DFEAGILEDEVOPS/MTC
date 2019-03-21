'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  return `
    REVOKE CREATE TABLE TO [${config.Sql.PupilCensus.Username}];
    REVOKE SELECT,UPDATE,INSERT,EXECUTE  ON schema::[mtc_admin] TO [${config.Sql.PupilCensus.Username}];
    `
}
