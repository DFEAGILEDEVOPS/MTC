'use strict'

const sql = require('mssql')
const config = require('../config')
const { performance } = require('perf_hooks')

const password = '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK'
const teacherCount = config.DummyData.SchoolCount
const schoolOffset = config.DummyData.SchoolOffset
const teacherRoleId = 3
let schoolId = schoolOffset
let teacherIndex = schoolOffset
const teacherUpperLimit = teacherCount + schoolOffset

const table = new sql.Table('mtc_admin.user')
table.create = false
table.columns.add('identifier', sql.NVarChar(64), { nullable: false })
table.columns.add('passwordHash', sql.NVarChar, { length: 'max' })
table.columns.add('school_id', sql.Int)
table.columns.add('role_id', sql.Int, { nullable: false })

for (teacherIndex = 10001; teacherIndex < teacherUpperLimit; teacherIndex++) {
  table.rows.add(`bulk-teacher${teacherIndex + 1}`, password, schoolId++, teacherRoleId)
}

const pool = new sql.ConnectionPool(config.Sql)
pool.connect()
  .then(() => {
    console.log('connected')
    console.log(`inserting range of teachers from ${schoolOffset} to ${teacherUpperLimit}...`)
    const request = new sql.Request(pool)
    const start = performance.now()
    request.bulk(table, async (err, result) => {
      const end = performance.now()
      const durationInMilliseconds = end - start
      const timeStamp = new Date().toISOString()
      if (err) {
        console.error(err.message)
        await pool.close()
        process.exit(-1)
      }
      console.log(`bulk teacher insert: ${timeStamp} completed in ${durationInMilliseconds} ms`)
      await pool.close()
    })
  })
