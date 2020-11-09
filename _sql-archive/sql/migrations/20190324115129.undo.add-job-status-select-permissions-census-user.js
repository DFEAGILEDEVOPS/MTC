'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  return `
    REVOKE SELECT ON [mtc_admin].[jobStatus] TO [${config.Sql.PupilCensus.Username}];
    GO
    REVOKE SELECT ON [mtc_admin].[job] TO [${config.Sql.PupilCensus.Username}];
    GO
    `
}
