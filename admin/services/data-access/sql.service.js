'use strict'

const Request = require('tedious').Request
const connectionService = require('./sql.connection.service')

const sqlService = {}

sqlService.query = async (sql, params) => {
  const con = await connectionService.getConnection()
  let results = []

  return new Promise((resolve, reject) => {
    var request = new Request(sql, function (err, rowCount) {
      if (err) reject(err)
      console.log('rows returned:', rowCount)
      resolve(results)
      con.release()
    })

    for (let index = 0; index < params.length; index++) {
      const param = params[index]
      // TODO support other options
      request.addParameter(param.name, param.type, param.value)
    }

    request.on('row', function (cols) {
      results.push(cols)
    })
    con.execSql(request)
  })
}

module.exports = sqlService
