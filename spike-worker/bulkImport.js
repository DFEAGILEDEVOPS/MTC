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

let connection

const doBulkInsert = (csvPayload) => {
  if (!connection) {
    throw new Error('connection not initialised')
  }

  // optional BulkLoad options
  const options = { keepNulls: true }

  // instantiate - provide the table where you'll be inserting to, options and a callback
  const bulkLoad = connection.newBulkLoad(`${config.Sql.Database}.[mtc_admin].[pupil]`, options, function (error, rowCount) {
    if (error) {
      console.error('import failed...')
      console.error(error)
    }
    console.log('inserted %d rows', rowCount)
  })

  // setup your columns - always indicate whether the column is nullable
  // TODO add all fields that are being imported to this list
  bulkLoad.addColumn('firstName', TYPES.Int, { nullable: false })
  bulkLoad.addColumn('lastName', TYPES.NVarChar, { length: 50, nullable: true })
  // etc....

  for (let index = 0; index < csvPayload.length; index++) {
    const csvRow = csvPayload[index]
    // TODO map all fields into the object
    bulkLoad.addRow({ firstName: csvRow.firstName, lastName: csvRow.lastName })
  }
  // execute
  connection.execBulkLoad(bulkLoad)
}

module.exports = (csvPayload) => {
  connection = new Connection(dbConfig)

  connection.on('connect', function (error) {
    if (error) {
      console.error(error)
    }
    doBulkInsert(csvPayload)
    console.log('import complete')
  })
}
