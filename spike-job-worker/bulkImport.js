'use strict'

const TYPES = require('tedious').TYPES
const Connection = require('tedious').Connection
const config = require('./config')

const dbConfig = {
  userName: config.Sql.Username,
  password: config.Sql.Password,
  server: config.Sql.Server,
  database: config.Sql.Database,
  options: {
    encrypt: config.Sql.Encrypt
  }
}

module.exports = (csvPayload) => {
  const connection = new Connection(dbConfig)

  connection.on('connect', function (error) {
    if (error) {
      console.error(error)
    }
    doBulkInsert()
  })

  const doBulkInsert = (csvPayload) => {
    // optional BulkLoad options
    const options = { keepNulls: true }

    // instantiate - provide the table where you'll be inserting to, options and a callback
    const bulkLoad = connection.newBulkLoad('censusTable', options, function (error, rowCount) {
      if (error) {
        console.error('import failed...')
        console.error(error)
      }
      console.log('inserted %d rows', rowCount)
    })

    // setup your columns - always indicate whether the column is nullable
    bulkLoad.addColumn('firstName', TYPES.Int, { nullable: false })
    bulkLoad.addColumn('lastName', TYPES.NVarChar, { length: 50, nullable: true })
    // etc....

    for (let index = 0; index < csvPayload.length; index++) {
      const csvRow = csvPayload[index]
      bulkLoad.addRow({ firstName: csvRow.firstName, lastName: csvRow.lastName })
    }
    // execute
    connection.execBulkLoad(bulkLoad)
  }
}
