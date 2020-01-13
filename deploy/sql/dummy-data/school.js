'use strict'

const sql = require('mssql')
const config = require('../config')

const schoolCount = 20000

const table = new sql.Table('mtc_admin.school')
table.create = false
table.columns.add('leaCode', sql.Int)
table.columns.add('estabCode', sql.NVarChar, { length: 'max' })
table.columns.add('name', sql.NVarChar, { length: 'max', nullable: false })
table.columns.add('urn', sql.Int, { nullable: false })
table.columns.add('dfeNumber', sql.Int, { nullable: false })
for (let idx = 0; idx < schoolCount; idx++) {
  table.rows.add(777, 'estab', `bulk school ${idx + 1}`, idx + 1, idx + 1)
}

const pool = new sql.ConnectionPool(config.Sql)
pool.connect()
  .then(() => {
    console.log('connected')
    console.log(`inserting ${schoolCount} schools...`)
    const request = new sql.Request(pool)
    request.bulk(table, async (err, result) => {
      if (err) {
        console.error(err.message)
        await pool.close()
        process.exit(-1)
      }
      console.log('all done')
      await pool.close()
    })
  })
