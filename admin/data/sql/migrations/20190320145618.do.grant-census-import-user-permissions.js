'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  if (config.Sql.Azure.Scale) {
    return `
    GRANT CREATE TABLE TO [${config.Sql.PupilCensus.Username}];
    GRANT INSERT,UPDATE ON schema::[mtc_admin] TO [${config.Sql.PupilCensus.Username}];
    `
  } else {
    return ''
  }
}
