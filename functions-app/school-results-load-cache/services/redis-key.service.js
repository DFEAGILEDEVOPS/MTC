'use strict'

const redisKeyService = {
  /**
   * Return the key for the school results
   * @param schoolId DB school.id
   * @return {string}
   */
  getSchoolResultsKey (schoolId) {
    return `result:${schoolId}`
  }
}

module.exports = redisKeyService
