'use strict'

const schoolDataService = require('../services/data-access/school.data.service')
const pupilCensusImportDataService = require('../services/data-access/pupil-census-import.data.service')
const pupilCensusProcessingService = {}

/**
 * Processes and bulk imports pupil census
 * @param csvData
 * @return {Promise<void>}
 */
pupilCensusProcessingService.process = async(csvData) => {
  // Fetch all school for pupil records
  let schoolDfeNumbers = csvData.map(r => `${r[0]}${r[1]}`)
  // filter duplicate entries
  schoolDfeNumbers = schoolDfeNumbers.filter((item, pos, self) => self.indexOf(item) === pos)
  let schools = await schoolDataService.sqlFindByDfeNumbers(schoolDfeNumbers)
  return pupilCensusImportDataService.sqlBulkImport(csvData, schools)
}

module.exports = pupilCensusProcessingService
