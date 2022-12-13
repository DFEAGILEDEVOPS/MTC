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

  /**
   * the key used to store the ancillary pupil uuid lookup by check code
   * @param {string} checkCode
   */
  getPupilUuidLookupKey (checkCode) {
    return `pupil-uuid-lookup:${checkCode}`
  },

  /**
   * return the key used to store the prepared check entry for pupil API
   * @param {string} schoolPin
   * @param {number} pupilPin
   */
  getPreparedCheckKey (schoolPin, pupilPin) {
    return `preparedCheck:${schoolPin}:${pupilPin}`
  },

  /**
   * return the key used to store the check forms
   * @param {number} checkWindowId
   * @param {boolean} isLiveCheck
   */
  getCheckFormsKey (checkWindowId, isLiveCheck) {
    return `checkForms:${checkWindowId}:live:${isLiveCheck}`
  },

  /**
   * Return the key used to store sas token, using the queue name
   * @param queueName
   * @return {string}
   */
  getSasTokenKey (queueName) {
    return `sasToken:${queueName}`
  },

  /**
   * Return the key for the school results
   * @param schoolId DB school.id
   * @return {string}
   */
  getSchoolResultsKey (schoolId) {
    return `result:${schoolId}`
  },

  /**
   * Return the key for the cached LA Codes
   * @return {string}
   */
  getLaCodesKey () {
    return 'lacodes'
  },

  /**
   * Return the key for the system wide service message
   * @return {string}
   */
  getServiceMessageKey () {
    return 'serviceMessage'
  },

  /**
   * Return the key for the system wide settings
   * @return {string}
   */
  getSettingsKey () {
    return 'settings'
  },

   /**
   * Return the key for the Qr Code URL
   * @param {string} url
   * @return {string}
   */
  getQrCodeUrlPrefix (url) {
    return `qrCodeUrl:${url}`
  }
}

module.exports = redisKeyService
