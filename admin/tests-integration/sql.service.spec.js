'use strict'
/* global describe beforeEach beforeAll afterEach it expect jasmine spyOn fail */

require('dotenv').config()
const sql = require('../services/data-access/sql.service')
const sqlPool = require('../services/data-access/sql.pool.service')
const Connection = require('tedious').Connection
const Request = require('tedious').Request

const executeAdminRequest = (adminConnection, sql) => {
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
    adminConnection.execSql(request)
  })
}

const adminConfig = {
  appName: 'MTC SQL Integration Tests',
  userName: process.env.SQL_ADMIN_USER,
  password: process.env.SQL_ADMIN_USER_PASSWORD,
  server: process.env.SQL_SERVER,
  port: process.env.SQL_PORT || 1433,
  options: {
    database: process.env.SQL_DATABASE,
    encrypt: true,
    requestTimeout: process.env.SQL_TIMEOUT
  }
}

const createTable = async (adminConnection, done) => {
  const tableRows = 1000
  const timerName = 'Time to create Table:'
  console.log(`creating table with ${tableRows} rows`)
  try {
    await executeAdminRequest(adminConnection, 'DROP TABLE IF EXISTS IntegrationTestTable')
    console.time(timerName)
    await executeAdminRequest(adminConnection, `WITH a AS (SELECT * FROM (VALUES(1),(2),(3),(4),(5),(6),(7),(8),(9),(10)) AS a(a)) SELECT TOP(${tableRows}) ROW_NUMBER() OVER (ORDER BY a.a) AS OrderItemId,a.a + b.a + c.a + d.a + e.a + f.a + g.a + h.a AS OrderId,a.a * 10 AS Price, CONCAT(a.a, N' ', b.a, N' ', c.a, N' ', d.a, N' ', e.a, N' ', f.a, N' ', g.a, N' ', h.a) AS ProductName INTO IntegrationTestTable FROM a, a AS b, a AS c, a AS d, a AS e, a AS f, a AS g, a AS h;`)
    console.timeEnd(timerName)
    adminConnection.close()
  } catch (error) {
    fail(error)
  }
  // initialise pool of 'app user' connections
  sqlPool.init()
  done()
}

describe('sql.service:integration', () => {
  beforeAll(async (done) => {
    const adminConnection = new Connection(adminConfig)
    adminConnection.on('connect', (err) => {
      if (err) throw err
      createTable(adminConnection, done)
    })
  })

  it('should permit select query with no parameters', async (done) => {
    let settingsRows
    try {
      settingsRows = await sql.query('SELECT * FROM Settings')
      console.dir(settingsRows)
    } catch (error) {
      fail(error)
    }
    done()
  })

  it('should not permit delete operation to mtc application user', async (done) => {
    try {
      await sql.query('DELETE FROM Settings')
      fail('delete operation should not have succeeded')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message.startsWith('The DELETE permission was denied')).toBe(true)
      done()
    }
  })
})
