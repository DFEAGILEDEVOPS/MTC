'use strict'
const config = require('../config')

const NAMES = {
  CHECK_SUBMIT: 'check-submitted', // replaces check-complete
  CHECK_COMPLETE: 'check-complete',
  CHECK_STARTED: 'check-started',
  PREPARE_CHECK: 'prepare-check',
  PUPIL_FEEDBACK: 'pupil-feedback',
  PUPIL_PREFS: 'pupil-prefs',
  PUPIL_STATUS: 'pupil-status',
  SQL_UPDATE: 'sql-update'
}

Object.freeze(NAMES)

const nameService = {
  /**
   * Returns the correct queue name for the environment based on a key.
   * E.g.
   * @param qName - the basic queue name
   * @return {string}
   */
  getName: function (qName) {
    const prefix = config.Azure.queuePrefix
    const qNameKey = qName.toUpperCase().replace('-', '_')
    if (!{}.hasOwnProperty.call(NAMES, qNameKey)) {
      throw new Error('Queue not found: ' + qName)
    }

    // If the config prefix is an empty string - there is nothing to do, so return the queue name as it is.
    if (!prefix) {
      return qName
    }
    // Queue naming info: https://docs.microsoft.com/en-us/rest/api/storageservices/naming-queues-and-metadata
    return `${prefix}-${qName}`
  },

  NAMES
}

module.exports = nameService
