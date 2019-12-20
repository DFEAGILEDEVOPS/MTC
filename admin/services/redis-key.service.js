'use strict'

const redisKeyService = {
  /**
   * Returns redis key name for school's pupil register
   * @param {Number} schoolId
   * @return {string}
   */
  getPupilRegisterViewDataKey (schoolId) {
    if (!schoolId) {
      throw new Error('School id parameter not provided')
    }
    return `pupilRegisterViewData:${schoolId}`
  },

  /**
   * Return the key used to store the primary prepared check key
   * @param {string} checkCode
   * @return {string}
   */
  getPreparedCheckLookup (checkCode) {
    return `prepared-check-lookup:${checkCode}`
  },

  getPupilUuidLookupKey (checkCode) {
    return `pupil-uuid-lookup:${checkCode}`
  }
}

module.exports = redisKeyService
