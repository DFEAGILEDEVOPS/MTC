const sqlConnectionService = require('./services/data-access/sql.connection.service')
const sqlService = require('./services/data-access/sql.service')

sqlConnectionService.init()

module.exports = () => {
  sqlService.query('SELECT * FROM settings')
  .then(result => console.log('query settings table result:', result))
}
