'use strict'

const redisCacheService = require('./data-access/redis-cache.service')

const pupilRegisterCachingService = {
  /**
   * Set the pupil register cache for a particular school based on received data
   * @param {Number} schoolId
   * @param {Array} pupilRegisterViewData
   * @return {Array}
   */
  setPupilRegisterCache: async function (schoolId, pupilRegisterViewData) {
    if (!schoolId) {
      throw new Error('School id not found in session')
    }
    if (!pupilRegisterViewData || pupilRegisterViewData.length === 0) {
      throw new Error('Pupil register view data not provided')
    }
    const pupilRegisterRedisKey = `pupilRegisterViewData:${schoolId}`
    return redisCacheService.set(pupilRegisterRedisKey, pupilRegisterViewData)
  },

  /**
   * Drop the pupil register cache for a particular school when add or edit occurs
   * @param {Number} schoolId
   * @return {Promise<Array>}
   */
  dropPupilRegisterCache: async function (schoolId) {
    if (!schoolId) {
      throw new Error('School id not found in session')
    }
    const pupilRegisterRedisKey = `pupilRegisterViewData:${schoolId}`
    return redisCacheService.drop(pupilRegisterRedisKey)
  }
}

module.exports = pupilRegisterCachingService
