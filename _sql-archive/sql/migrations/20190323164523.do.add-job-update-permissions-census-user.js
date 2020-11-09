'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  return `
    GRANT UPDATE ON [mtc_admin].[job] TO [${config.Sql.PupilCensus.Username}];
    GO
    `
}
