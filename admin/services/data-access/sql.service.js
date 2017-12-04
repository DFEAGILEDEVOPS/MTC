'use strict'

const Request = require('tedious').Request
const connectionService = require('./sql.connection.service')

const sqlService = {}

sqlService.query = (sql, params) => {
  return new Promise(async (resolve, reject) => {
    const con = await connectionService.getConnection()
    let results = []
    // http://tediousjs.github.io/tedious/api-request.html
    var request = new Request(sql, function (err, rowCount) {
      if (err) reject(err)
      // TODO request also emits a 'done' event for each SQL statement.
      // which is a more deterministic completion?
      con.release()
      resolve(results)
    })

    if (params) {
      for (let index = 0; index < params.length; index++) {
        const param = params[index]
        // TODO support other options
        request.addParameter(param.name, param.type, param.value)
      }
    }

    request.on('row', function (cols) {
      results.push(cols)
    })
    con.execSql(request)
  })
}

sqlService.modify = async (sql, params) => {
  return new Promise(async (resolve, reject) => {
    const con = await connectionService.getConnection()

    var request = new Request(sql, function (err, rowCount) {
      if (err) reject(err)
      con.release()
      resolve(rowCount)
    })

    if (params) {
      for (let index = 0; index < params.length; index++) {
        const param = params[index]
        // TODO add support for other options
        request.addParameter(param.name, param.type, param.value)
      }
    }
    con.execSql(request)
  })
}

module.exports = sqlService
