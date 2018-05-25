'use strict'

const TYPES = require('tedious').TYPES
const Connection = require('tedious').Connection
const config = require('./config')
const moment = require('moment')

const schoolDataService = require('../admin/services/data-access/school.data.service')

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

const doBulkInsert = async (csvPayload) => {
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
  bulkLoad.addColumn('school_id', TYPES.Int, { nullable: false })
  bulkLoad.addColumn('upn', TYPES.Char, { length: 13, nullable: false })
  bulkLoad.addColumn('lastName', TYPES.NVarChar, { length: 'max', nullable: false })
  bulkLoad.addColumn('foreName', TYPES.NVarChar, { length: 'max', nullable: false })
  bulkLoad.addColumn('middleNames', TYPES.NVarChar, { length: 'max', nullable: true })
  bulkLoad.addColumn('gender', TYPES.Char, { length: 1, nullable: false })
  bulkLoad.addColumn('dateOfBirth', TYPES.DateTimeOffset, { nullable: false })

  // Fetch all school for pupil records
  let schoolDfeNumbers = csvPayload.map(r => `${r[0]}${r[1]}`)
  // filter duplicate entries
  schoolDfeNumbers = schoolDfeNumbers.filter((item, pos, self) => self.indexOf(item) === pos)
  const schools = await schoolDataService.sqlFindByDfeNumbers(schoolDfeNumbers)

  for (let index = 0; index < csvPayload.length; index++) {
    const csvRow = csvPayload[index]
    const dfeNumber = `${csvRow[0]}${csvRow[1]}`
    const school = schools.find(s => s.dfeNumber === parseInt(dfeNumber))
    const schoolId = school && school.id
    if (!schoolId) {
      console.error(`School id not found for DfeNumber ${dfeNumber}`)
      process.exit(1)
    }
    bulkLoad.addRow({
      school_id: schoolId,
      upn: csvRow[2],
      lastName: csvRow[3],
      foreName: csvRow[4],
      middleNames: csvRow[5],
      gender: csvRow[6],
      dateOfBirth: moment(csvRow[7]).toDate()
    })
  }
  // execute
  connection.execBulkLoad(bulkLoad)
}

function doWork (csvPayload) {
  return new Promise((resolve, reject) => {
    connection = new Connection(dbConfig)
    connection.on('connect', async function (error) {
      if (error) {
        reject(error)
      }
      await doBulkInsert(csvPayload)
      resolve()
    })
  })
}

module.exports = async (csvPayload) => {
  await doWork(csvPayload)
  console.log('import complete')
}
