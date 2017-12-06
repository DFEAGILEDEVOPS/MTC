'use strict'

const Request = require('tedious').Request
const Connection = require('tedious').Connection
const twoMinutesInMilliseconds = 120000

const adminConfig = {
  appName: process.env.SQL_APP_NAME,
  userName: process.env.SQL_ADMIN_USER,
  password: process.env.SQL_ADMIN_USER_PASSWORD,
  server: process.env.SQL_SERVER,
  port: process.env.SQL_PORT || 1433,
  options: {
    database: 'master',
    encrypt: true,
    requestTimeout: twoMinutesInMilliseconds
  }
}

const executeRequest = (connection, sql) => {
  return new Promise((resolve, reject) => {
    let results = []
    // http://tediousjs.github.io/tedious/api-request.html
    var request = new Request(sql, function (err, rowCount) {
      if (err) reject(err)
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
    const timerName = 'Time taken to create database'
    console.time(timerName)
    const output = await executeRequest(connection,
      `IF NOT EXISTS(SELECT * FROM sys.databases WHERE name='${process.env.SQL_DATABASE}') BEGIN CREATE DATABASE [${process.env.SQL_DATABASE}]; SELECT 'Database Created'; END ELSE SELECT 'Database Already Exists'`)
    console.timeEnd(timerName)
    console.log(output[0][0].value)
  } catch (error) {
    console.error(error)
  }
}

const main = () => {
  return new Promise((resolve, reject) => {
    const connection = new Connection(adminConfig)
    connection.on('connect', (err) => {
      if (err) reject(err)
      createDatabase(connection).then(() => {
        connection.close()
        resolve()
      })
    })
  })
}

module.exports = main
