'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  if (config.Sql.Azure.Scale) {
    return `GRANT UPDATE,INSERT,CREATE TABLE ON schema::[mtc_admin] to [${config.Sql.PupilCensus.Username}];`
  } else {
    return ''
  }
}
