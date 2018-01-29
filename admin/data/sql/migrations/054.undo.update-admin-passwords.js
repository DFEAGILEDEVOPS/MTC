'use strict'

const defaultPassword = '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK'

module.exports.generateSql = () => {
  return `UPDATE [mtc_admin].[user] TO ${defaultPassword}`
}
