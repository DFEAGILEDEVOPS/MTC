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
  }
}

module.exports = redisKeyService
