'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  return `
    GRANT SELECT ON [mtc_admin].[jobStatus] TO [${config.Sql.PupilCensus.Username}];
    GO
    GRANT SELECT ON [mtc_admin].[job] TO [${config.Sql.PupilCensus.Username}];
    GO
    `
}
