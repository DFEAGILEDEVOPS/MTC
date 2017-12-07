'use strict'

const Request = require('tedious').Request
const sqlPoolService = require('./sql.pool.service')

function parseResults (results) {
  // TODO deconstruct array of arrays into object array
  return results
}

const sqlService = {}

  /**
 * Query data from the SQL Server Database
 * @param {string} sql - The SELECT statement to execute
 * @param {array} params - Array of parameters for SQL statement
 * @return {Promise<results>}
 */
sqlService.query = (sql, params) => {
  return new Promise(async (resolve, reject) => {
    let con
    try {
      con = await sqlPoolService.getConnection()
    } catch (error) {
      reject(error)
    }
    let results = []
    // http://tediousjs.github.io/tedious/api-request.html
    var request = new Request(sql, function (err, rowCount) {
      con.release()
      if (err) reject(err)
      resolve(parseResults(results))
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

 /**
 * Modify data in the SQL Server Database.
 * @param {string} sql - The INSERT/UPDATE/DELETE statement to execute
 * @param {array} params - Array of parameters for SQL statement
 * @return {Promise}
 */
sqlService.modify = (sql, params) => {
  return new Promise(async (resolve, reject) => {
    const con = await sqlPoolService.getConnection()

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
