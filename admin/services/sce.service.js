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
 * @param sceSchoolsData
 * @param school
 * @param timezone
 * @return {Promise<object>}
 */
sceService.insertOrUpdateSceSchool = async (sceSchoolsData, school, timezone) => {
  if (!school.id || !timezone) {
    throw new Error('school id and timezone are required')
  }
  const schoolIdxInSceSchoolsData = sceSchoolsData.findIndex(s => s.id === school.id)
  if (schoolIdxInSceSchoolsData === -1) {
    // specified school is not present in the data, add it
    return [ ...sceSchoolsData, school ]
  }

  // update the timezone
  sceSchoolsData[schoolIdxInSceSchoolsData].timezone = timezone

  return sceSchoolsData
}

/**
 * Removes the sce data for a school
 * @param schoolId
 * @return {Promise<object>}
 */
sceService.removeSceSchool = async (sceSchoolsData, urn) => {
  if (!urn) {
    throw new Error('School URN is required')
  }
  const schoolToDeleteIdx = sceSchoolsData.findIndex(s => s.urn === parseInt(urn, 10))
  if (schoolToDeleteIdx === -1) {
    throw new Error('SCE school not found')
  }
  const deletedSchool = sceSchoolsData.splice(schoolToDeleteIdx, 1)[0]
  return [sceSchoolsData, deletedSchool]
}

/**
 * Applies the current session changes for SCE schools
 * @param sceSchoolsData
 * @return {Promise<void>}
 */
sceService.applySceSettings = async (sceSchoolsData) => {
  // TODO: temporary, change to batch upsert
  await Promise.all(sceSchoolsData.map(async (school) => {
    return sceDataService.sqlUpsertSceSchool(school.id, school.timezone)
  }))
}

module.exports = sceService
