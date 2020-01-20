'use strict'

const sql = require('mssql')
const config = require('../config')

const teacherCount = config.DummyData.SchoolCount
const password = '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK'
const teacherRoleId = 3

const table = new sql.Table('mtc_admin.user')
table.create = false
table.columns.add('identifier', sql.NVarChar(64), { nullable: false })
table.columns.add('passwordHash', sql.NVarChar, { length: 'max' })
table.columns.add('school_id', sql.Int)
table.columns.add('role_id', sql.Int, { nullable: false })

for (let idx = 0; idx < teacherCount; idx++) {
  table.rows.add(`bulk-teacher${idx + 1}`, password, idx + 1, teacherRoleId)
}

const pool = new sql.ConnectionPool(config.Sql)
pool.connect()
  .then(() => {
    console.log('connected')
    console.log(`inserting ${teacherCount} teachers...`)
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
