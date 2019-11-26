'use strict'

const pupilRegisterCachingService = require('../services/pupil-register-caching.service')
const pupilRegisterV2DataService = require('./data-access/pupil-register-v2.data.service')
const pupilIdentificationFlagService = require('./pupil-identification-flag.service')
const redisCacheService = require('./data-access/redis-cache.service')
const tableSorting = require('../helpers/table-sorting')

const pupilRegisterV2Service = {
  /**
   * Return the pupil register
   * @param schoolId
   * @return {Promise<*>}
   */
  getPupilRegister: async function (schoolId) {
    const pupilRegisterRedisKey = `school:${schoolId}`
    let cachedPupilRegisterData
    const result = await redisCacheService.get(pupilRegisterRedisKey)
    try {
      cachedPupilRegisterData = JSON.parse(result)
      if (cachedPupilRegisterData) {
        return cachedPupilRegisterData
      }
    } catch (ignore) {}
    const pupilRegisterData = await pupilRegisterCachingService.setPupilRegisterCache(schoolId, pupilRegisterV2DataService.getPupilRegister)
    const pupilRegister = pupilRegisterData.map(d => {
      return {
        urlSlug: d.urlSlug,
        foreName: d.foreName,
        lastName: d.lastName,
        middleNames: d.middleNames,
        dateOfBirth: d.dateOfBirth,
        group: d.groupName
      }
    })
    return pupilIdentificationFlagService.addIdentificationFlags(tableSorting.applySorting(pupilRegister, 'lastName'))
  }
}

module.exports = pupilRegisterV2Service
