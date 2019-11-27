'use strict'

// const pupilRegisterCachingService = require('../services/pupil-register-caching.service')
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
    if (!schoolId) {
      throw new Error('School id not found in session')
    }
    const pupilRegisterRedisKey = `school:${schoolId}`
    const result = await redisCacheService.get(pupilRegisterRedisKey)
    if (result && result.length > 0) {
      return result
    }
    return this.getPupilRegisterViewData(schoolId)
  },

  /**
   * Return the pupil register
   * @param schoolId
   * @return {Promise<*>}
   */
  getPupilRegisterViewData: async function (schoolId) {
    const pupilRegisterData = await pupilRegisterV2DataService.getPupilRegister(schoolId)
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
    const pupilRegisterViewData = pupilIdentificationFlagService.addIdentificationFlags(tableSorting.applySorting(pupilRegister, 'lastName'))
    const pupilRegisterRedisKey = `school:${schoolId}`
    await redisCacheService.set(pupilRegisterRedisKey, pupilRegisterViewData)
    return pupilRegisterViewData
  }
}

module.exports = pupilRegisterV2Service
