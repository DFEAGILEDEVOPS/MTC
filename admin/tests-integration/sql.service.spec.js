'use strict'
/* global describe beforeEach beforeAll afterEach it expect jasmine spyOn fail */

require('dotenv').config()
const sql = require('../services/data-access/sql.service')
const sqlConnection = require('../services/data-access/sql.connection.service')

describe('sql.service:integration', () => {
  beforeAll(async (done) => {
    sqlConnection.init()
    const tableRows = 1000
    const timerName = 'Time to create Table:'
    console.log(`creating table with ${tableRows} rows`)
    try {
      await sql.query('DROP TABLE IntegrationTestTable')
      console.time(timerName)
      await sql.query(`WITH a AS (SELECT * FROM (VALUES(1),(2),(3),(4),(5),(6),(7),(8),(9),(10)) AS a(a)) SELECT TOP(${tableRows}) ROW_NUMBER() OVER (ORDER BY a.a) AS OrderItemId,a.a + b.a + c.a + d.a + e.a + f.a + g.a + h.a AS OrderId,a.a * 10 AS Price, CONCAT(a.a, N' ', b.a, N' ', c.a, N' ', d.a, N' ', e.a, N' ', f.a, N' ', g.a, N' ', h.a) AS ProductName INTO IntegrationTestTable FROM a, a AS b, a AS c, a AS d, a AS e, a AS f, a AS g, a AS h;`)
      console.timeEnd(timerName)
    } catch (error) {
      fail(error)
      done()
    }
    done()
  })

  it('should permit select query with no parameters', async (done) => {
    const timerName = 'Time to sum price column of all rows'
    console.time(timerName)
    let priceSum
    try {
      priceSum = await sql.query('SELECT SUM(Price) FROM IntegrationTestTable')
      console.dir(priceSum)
    } catch (error) {
      fail(error)
    }
    console.timeEnd(timerName)
    console.log('returned value:', priceSum)
    done()
  })
})
