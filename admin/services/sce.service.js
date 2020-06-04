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
sceService.insertOrUpdateSceSchool = async (schoolId, timezone, countryCode) => {
  if (!schoolId) {
    throw new Error('schoolId is required')
  }
  return sceDataService.sqlUpsertSceSchool(schoolId, timezone, countryCode)
}

/**
 * Removes the sce data for a school
 * @param {string} urn - the unique reference number of the school
 * @return {Promise<object>}
 */
sceService.removeSceSchool = async (urn) => {
  if (!urn) {
    throw new Error('School URN is required')
  }
  const sceSchools = await sceService.getSceSchools()
  const schoolToDeleteIdx = sceSchools.findIndex(s => s.urn === parseInt(urn, 10))
  if (schoolToDeleteIdx === -1) {
    throw new Error('SCE school not found')
  }
  const deletedSchool = sceSchools.splice(schoolToDeleteIdx, 1)[0]
  await sceService.applySceSettings(sceSchools)
  return deletedSchool
}

/**
 * Applies the current changes for SCE schools
 * @param sceSchoolsData
 * @return {Promise<void>}
 */
sceService.applySceSettings = async (sceSchoolsData) => {
  return sceDataService.sqlUpsertSchoolsBatch(sceSchoolsData)
}

module.exports = sceService
