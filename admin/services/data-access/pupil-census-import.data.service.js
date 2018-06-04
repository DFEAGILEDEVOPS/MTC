'use strict'

const { TYPES } = require('tedious')
const moment = require('moment')

const config = require('../../config')
const pupilCensusImportDataService = {}
const sqlService = require('./sql.service')
const sqlPoolService = require('./sql.pool.service')

/**
 * Execute pupil data bulk import
 * @param {Array} pupilData
 * @param {Array} schools
 * @return {Promise<*>}
 */
pupilCensusImportDataService.sqlBulkImport = async(pupilData, schools) => {
  const result = {}
  const con = await sqlPoolService.getConnection()

  try {
    result.output = await bulkLoadData(con, pupilData, schools)
  } catch (error) {
    result.errorOutput = error
  }
  con.release()
  return result
}

const bulkLoadData = (connection, pupilData, schools) => {
  return new Promise((resolve, reject) => {
    const bulkLoad = connection.newBulkLoad(`${config.Sql.Database}.${sqlService.adminSchema}.[pupil]`, function (error, rowCount) {
      if (error) {
        return reject(error)
      }
      resolve(`Inserted ${rowCount} rows`)
    })

    bulkLoad.addColumn('school_id', TYPES.Int, {nullable: false})
    bulkLoad.addColumn('upn', TYPES.Char, {length: 13, nullable: false})
    bulkLoad.addColumn('lastName', TYPES.NVarChar, {length: 'max', nullable: false})
    bulkLoad.addColumn('foreName', TYPES.NVarChar, {length: 'max', nullable: false})
    bulkLoad.addColumn('middleNames', TYPES.NVarChar, {length: 'max', nullable: true})
    bulkLoad.addColumn('gender', TYPES.Char, {length: 1, nullable: false})
    bulkLoad.addColumn('dateOfBirth', TYPES.DateTimeOffset, {nullable: false})

    for (let index = 0; index < pupilData.length; index++) {
      const csvRow = pupilData[index]
      const dfeNumber = `${csvRow[0]}${csvRow[1]}`
      const school = schools.find(s => s.dfeNumber === parseInt(dfeNumber))
      const schoolId = school && school.id
      if (!schoolId) {
        reject(new Error(`School id not found for DfeNumber ${dfeNumber} for pupil on row number ${index + 1}`))
      }
      bulkLoad.addRow({
        school_id: schoolId,
        upn: csvRow[2],
        lastName: csvRow[3],
        foreName: csvRow[4],
        middleNames: csvRow[5],
        gender: csvRow[6],
        dateOfBirth: moment(csvRow[7], 'MM/DD/YY').toDate()
      })
    }
    connection.execBulkLoad(bulkLoad)
  })
}

module.exports = pupilCensusImportDataService
