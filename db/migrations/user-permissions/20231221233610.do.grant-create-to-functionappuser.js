'use strict'

const config = require('../../config')
module.exports.generateSql = function () {
  return `GRANT CREATE TABLE TO [${config.Sql.FunctionsApp.Username}]`
}
