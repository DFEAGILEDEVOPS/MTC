'use strict'

// const pupilRegisterCachingService = require('../services/pupil-register-caching.service')
const pupilRegisterV2DataService = require('./data-access/pupil-register-v2.data.service')
const pupilIdentificationFlagService = require('./pupil-identification-flag.service')
const redisCacheService = require('./data-access/redis-cache.service')
const redisKeyService = require('../services/redis-key.service')
const tableSorting = require('../helpers/table-sorting')

const pupilRegisterV2Service = {
  /**
   * Return the pupil register
   * @param schoolId
   * @return {Promise<*>}
   */
  getPupilRegister: async function (schoolId) {
    if (!schoolId) {
      throw new Error('School id not found in session')
    }
    const pupilRegisterRedisKey = redisKeyService.getPupilRegisterViewDataKey(schoolId)
    const result = await redisCacheService.get(pupilRegisterRedisKey)
    if (result && result.length > 0) {
      return result
    }
    return this.getPupilRegisterViewData(schoolId, pupilRegisterRedisKey)
  },

  /**
   * Store the pupil register view data in redis and return the data set
   * @param {Number} schoolId
   * @param {String} pupilRegisterRedisKey
   * @return {Array}
   */
  getPupilRegisterViewData: async function (schoolId, pupilRegisterRedisKey) {
    const pupilRegisterData = await pupilRegisterV2DataService.getPupilRegister(schoolId)
    const pupilRegister = pupilRegisterData.map(d => {
      return {
        urlSlug: d.urlSlug,
        foreName: d.foreName,
        lastName: d.lastName,
        middleNames: d.middleNames,
        dateOfBirth: d.dateOfBirth,
        group: d.groupName,
        upn: d.upn
      }
    })
    const pupilRegisterViewData = pupilIdentificationFlagService.addIdentificationFlags(tableSorting.applySorting(pupilRegister, 'lastName'))
    await redisCacheService.set(pupilRegisterRedisKey, pupilRegisterViewData)
    return pupilRegisterViewData
  }
}

module.exports = pupilRegisterV2Service
