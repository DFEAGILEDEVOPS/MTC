'use strict'

const redisCacheService = require('./data-access/redis-cache.service')

const pupilRegisterCachingService = {
  /**
   * Set the pupil register cache for a particular school
   * @param {Number} schoolId
   * @param {Function} getPupilRegister
   * @return {Array}
   */
  setPupilRegisterCache: async function (schoolId, getPupilRegister) {
    if (!schoolId) {
      throw new Error('School id not found in session')
    }
    if (!getPupilRegister) {
      throw new Error('Data method for retrieving pupils not provided')
    }
    const pupilRegisterRedisKey = `school:${schoolId}`
    const pupilRegisterData = await getPupilRegister(schoolId)
    await redisCacheService.set(pupilRegisterRedisKey, pupilRegisterData)
    return pupilRegisterData
  }
}

module.exports = pupilRegisterCachingService
