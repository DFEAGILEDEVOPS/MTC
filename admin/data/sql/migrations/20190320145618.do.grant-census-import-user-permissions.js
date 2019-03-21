'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  return `
    GRANT CREATE TABLE TO [${config.Sql.PupilCensus.Username}];
    GRANT SELECT,UPDATE,INSERT,EXECUTE ON schema::[mtc_admin] TO [${config.Sql.PupilCensus.Username}];
    `
}
