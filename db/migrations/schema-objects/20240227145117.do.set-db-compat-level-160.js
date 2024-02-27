'use strict'

const config = require('../../config')

// uplift to 160 to utilise GENERATE_SERIES function

module.exports.generateSql = function () {
  return `
    ALTER DATABASE [${config.Sql.Database}]
    SET COMPATIBILITY_LEVEL = 160;
    `
}
