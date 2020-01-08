'use strict'

const sql = require('mssql')
const config = require('../config')
const uuid = require('uuid/v4')

const pupilCountPerSchool = 30
let schoolCount = 20000
let schoolId = 6

const table = new sql.Table('mtc_admin.pupil')
table.create = false
table.columns.add('school_id', sql.Int, { nullable: false })
table.columns.add('foreName', sql.NVarChar, { length: 128 })
table.columns.add('lastName', sql.NVarChar, { length: 128 })
table.columns.add('gender', sql.Char, { length: 1, nullable: false })
table.columns.add('dateOfBirth', sql.DateTimeOffset(3), { nullable: false })
table.columns.add('upn', sql.Char(13), { nullable: false })

for (let schoolIdx = 0; schoolIdx < schoolCount; schoolIdx++) {
  for (let pupilIndex = 0; pupilIndex < pupilCountPerSchool; pupilIndex++) {
    table.rows.add(schoolId, `bulk pupil ${pupilIndex + 1}`, `pupil ${pupilIndex + 1}`,
      'F', new Date('2009-01-01'), genFakeUpn())
    schoolId++
  }
}

const pool = new sql.ConnectionPool(config.Sql)
pool.connect()
  .then((x) => {
    console.log('connected')
    console.log(`inserting ${pupilCountPerSchool} pupils into ${schoolCount} schools...`)
    const request = new sql.Request(pool)
    request.bulk(table, (err, result) => {
      if (err) {
        console.error(err.message)
        process.exit(-1)
      }
      console.log('all done')
      process.exit(0)
    })
  })

function genFakeUpn () {
  var id = uuid()
  return id.replace('-', '').substr(0, 13)
}
