const sceDataService = require('../services/data-access/sce.data.service')

const sceService = {}

/**
 * Get school urns and names
 * @returns {Promise<Array>}
 */
sceService.getSchools = async () => {
  return sceDataService.sqlFindSchools()
}

/**
 * Get sce schools
 * @returns {Promise<Array>}
 */
sceService.getSceSchools = async () => {
  return sceDataService.sqlFindSceSchools()
}

/**
 * Inserts or updates the sce data for a school
 * @param schoolId
 * @param timezone
 * @return {Promise<object>}
 */
sceService.insertOrUpdateSceSchool = async (schoolId, timezone) => {
  if (!schoolId || !timezone) {
    throw new Error('schoolId and timezone are required')
  }
  return sceDataService.sqlUpsertSceSchool(schoolId, timezone)
}

/**
 * Removes the sce data for a school
 * @param schoolId
 * @return {Promise<object>}
 */
sceService.removeSceSchool = async (schoolId) => {
  if (!schoolId) {
    throw new Error('schoolId is required')
  }
  return sceDataService.sqlDeleteSceSchool(schoolId)
}

module.exports = sceService
