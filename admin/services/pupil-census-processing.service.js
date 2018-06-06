'use strict'
const R = require('ramda')

const schoolDataService = require('../services/data-access/school.data.service')
const pupilCensusImportDataService = require('../services/data-access/pupil-census-import.data.service')
const pupilCensusProcessingService = {}

/**
 * Processes and bulk imports pupil census
 * @param csvData
 * @param jobId
 * @return {Promise<void>}
 */
pupilCensusProcessingService.process = async (csvData, jobId) => {
  // Fetch all unique school for pupil records
  const schoolDfeNumbers = R.uniq(csvData.map(r => `${r[0]}${r[1]}`))
  let schools = await schoolDataService.sqlFindByDfeNumbers(schoolDfeNumbers)
  const schoolsHashMap = schools.reduce((obj, item) => {
    obj[item.dfeNumber] = item
    return obj
  }, {})
  return pupilCensusImportDataService.sqlBulkImport(csvData, schoolsHashMap, jobId)
}

module.exports = pupilCensusProcessingService
