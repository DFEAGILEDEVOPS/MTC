'use strict'

const TediousTypes = require('tedious').TYPES
const moment = require('moment')

const config = require('../../config')
const pupilCensusImportDataService = {}
const sqlService = require('./sql.service')
const sqlPoolService = require('./sql.pool.service')

/**
 * Calls bulk load data execution
 * @param {Array} pupilData
 * @param {Array} schools
 * @param {Number} jobId
 * @return {Promise<*>}
 */
pupilCensusImportDataService.sqlBulkImport = async (pupilData, schools, jobId) => {
  const result = {}
  const con = await sqlPoolService.getConnection()

  try {
    result.output = await bulkLoadData(con, pupilData, schools, jobId)
  } catch (error) {
    result.errorOutput = handleError(error)
  }
  con.release()
  return result
}

/**
 * Executes pupil data bulk import
 * @param {Object} connection
 * @param {Array} pupilData
 * @param {Array} schools
 * @param {Number} jobId
 * @return {Promise<*>}
 */
const bulkLoadData = (connection, pupilData, schools, jobId) => {
  return new Promise((resolve, reject) => {
    const bulkLoad = connection.newBulkLoad(`[${config.Sql.Database}].${sqlService.adminSchema}.[pupil]`, function (error, rowCount) {
      if (error) {
        return reject(error)
      }
      resolve(`Inserted ${rowCount} rows`)
    })

    bulkLoad.addColumn('school_id', TediousTypes.Int, { nullable: false })
    bulkLoad.addColumn('upn', TediousTypes.Char, { length: 13, nullable: false })
    bulkLoad.addColumn('lastName', TediousTypes.NVarChar, { length: 'max', nullable: false })
    bulkLoad.addColumn('foreName', TediousTypes.NVarChar, { length: 'max', nullable: false })
    bulkLoad.addColumn('middleNames', TediousTypes.NVarChar, { length: 'max', nullable: true })
    bulkLoad.addColumn('gender', TediousTypes.Char, { length: 1, nullable: false })
    bulkLoad.addColumn('dateOfBirth', TediousTypes.DateTimeOffset, { nullable: false })
    bulkLoad.addColumn('job_id', TediousTypes.Int, { nullable: true })

    for (let index = 0; index < pupilData.length; index++) {
      const csvRow = pupilData[index]
      const dfeNumber = `${csvRow[0]}${csvRow[1]}`
      const school = schools[parseInt(dfeNumber)]
      const schoolId = school && school.id
      if (!schoolId) {
        return reject(new Error(`School id not found for DfeNumber ${dfeNumber} for pupil on row number ${index + 1}`))
      }
      bulkLoad.addRow({
        school_id: schoolId,
        upn: csvRow[2] || null,
        lastName: csvRow[3] || null,
        foreName: csvRow[4] || null,
        middleNames: csvRow[5],
        gender: csvRow[6] || null,
        dateOfBirth: csvRow[7] !== '' ? moment(csvRow[7], 'DD/MM/YYYY').toDate() : null,
        job_id: jobId
      })
    }
    connection.execBulkLoad(bulkLoad)
  })
}

/**
 * Bulk upload Error handler
 * @param {Object} error
 * @return {String} - Error Object
 */
const handleError = (error) => {
  if (!error) {
    return 'Error received is undefined'
  }
  if (typeof error !== 'object') {
    return `Error type is ${typeof error} with value ${error.toString()}`
  }
  if (error || Object.keys(error).length === 0) {
    return `Error with no properties: ${error.toString()}`
  }
  if (error || !error.message) {
    return `Error with no message property: ${error.toString()} `
  }
  return error.toString()
}

module.exports = pupilCensusImportDataService
