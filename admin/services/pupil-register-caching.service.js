'use strict'

const featureToggles = require('feature-toggles')

const pupilRegisterV2Service = require('./pupil-register-v2.service')
const pupilRegisterService = require('./pupil-register.service')
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
    const pupilRegisterRedisKey = `school:${schoolId}`
    return redisCacheService.set(pupilRegisterRedisKey, pupilRegisterViewData)
  },

  /**
   * Refresh the pupil register cache for a particular school when add or edit occurs
   * @param {Number} schoolId
   * @return {Array}
   */
  refreshPupilRegisterCache: async function (schoolId) {
    if (!schoolId) {
      throw new Error('School id not found in session')
    }
    return featureToggles.isFeatureEnabled('pupilRegisterV2')
      ? pupilRegisterV2Service.getPupilRegisterViewData(schoolId) : pupilRegisterService.getPupilRegisterViewData(schoolId)
  }
}

module.exports = pupilRegisterCachingService
