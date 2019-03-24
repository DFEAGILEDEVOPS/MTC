'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  return `
    REVOKE UPDATE ON [mtc_admin].[job] TO [${config.Sql.PupilCensus.Username}];
    GO
    `
}
