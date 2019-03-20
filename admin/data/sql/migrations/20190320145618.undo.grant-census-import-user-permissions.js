'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  if (config.Sql.Azure.Scale) {
    return `
    REVOKE CREATE TABLE TO [${config.Sql.PupilCensus.Username}];
    REVOKE INSERT,UPDATE ON schema::[mtc_admin] TO [${config.Sql.PupilCensus.Username}];
    `
  } else {
    return ''
  }
}
