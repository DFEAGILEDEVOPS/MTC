'use strict'

const sqlPoolService = require('../services/data-access/sql.pool.service')
const schoolDataService = require('../services/data-access/school.data.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const pupilCensusProcessingService = {}

/**
 * Processes and bulk imports pupil census
 * @param csvData
 * @return {Promise<void>}
 */
pupilCensusProcessingService.process = async(csvData) => {
  const con = await sqlPoolService.getConnection()
  // Fetch all school for pupil records
  let schoolDfeNumbers = csvData.map(r => `${r[0]}${r[1]}`)
  // filter duplicate entries
  schoolDfeNumbers = schoolDfeNumbers.filter((item, pos, self) => self.indexOf(item) === pos)
  let schools = await schoolDataService.sqlFindByDfeNumbers(schoolDfeNumbers)
  return pupilDataService.sqlBulkImport(con, csvData, schools)
}

module.exports = pupilCensusProcessingService
