'use strict'

const Request = require('tedious').Request
const Connection = require('tedious').Connection
const twoMinutesInMilliseconds = 120000

const adminConfig = {
  appName: process.env.SQL_APP_NAME,
  userName: process.env.SQL_ADMIN_USER,
  password: process.env.SQL_ADMIN_USER_PASSWORD,
  server: process.env.SQL_SERVER,
  options: {
    database: 'master',
    encrypt: true,
    requestTimeout: twoMinutesInMilliseconds,
    port: process.env.SQL_PORT || 1433
  }
}

const executeRequest = (connection, sql) => {
  return new Promise((resolve, reject) => {
    let results = []
    // http://tediousjs.github.io/tedious/api-request.html
    var request = new Request(sql, function (err, rowCount) {
      if (err) {
        reject(err)
        return
      }
      resolve(results)
    })

    request.on('row', function (cols) {
      results.push(cols)
    })
    connection.execSql(request)
  })
}

const createDatabase = async (connection) => {
  try {
    let azureOnlyScaleSetting = ''
    if (process.env.SQL_SCALE) {
      azureOnlyScaleSetting = `(SERVICE_OBJECTIVE = '${process.env.SQL_SCALE}')`
    }
    console.log(`attempting to create database ${process.env.SQL_DATABASE} ${azureOnlyScaleSetting} if it does not already exist...`)
    const createDbSql = `IF NOT EXISTS(SELECT * FROM sys.databases WHERE name='${process.env.SQL_DATABASE}') BEGIN CREATE DATABASE [${process.env.SQL_DATABASE}] ${azureOnlyScaleSetting}; SELECT 'Database Created'; END ELSE SELECT 'Database Already Exists'`
    const output = await executeRequest(connection, createDbSql)
    console.log(output[0][0].value)
  } catch (error) {
    console.error(error)
  }
}

const main = () => {
  return new Promise((resolve, reject) => {
    console.log(`attempting to connect to ${adminConfig.server} on ${adminConfig.port} `)
    const connection = new Connection(adminConfig)
    connection.on('connect', (err) => {
      if (err) {
        reject(err)
        return
      }
      createDatabase(connection).then(() => {
        connection.close()
        resolve()
      })
    })
  })
}

module.exports = main
