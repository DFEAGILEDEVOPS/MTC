'use strict'

const config = require('../../../config')

module.exports.generateSql = function () {
  return `   
    GRANT UPDATE,INSERT ON [mtc_admin].[school] TO [${config.Sql.PupilCensus.Username}];
    `
}
