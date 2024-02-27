'use strict'

const config = require('../../config')

module.exports.generateSql = function () {
  return `
    ALTER DATABASE [${config.Sql.DatabaseName}]
    SET COMPATIBILITY_LEVEL = 150;
    `
}
