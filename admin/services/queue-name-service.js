'use strict'
const config = require('../config')

const NAMES = {
  PREPARE_CHECK: 'prepare-check',
  CHECK_COMPLETE: 'check-complete',
  PUPIL_FEEDBACK: 'pupil-feedback'
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
    if (!NAMES.hasOwnProperty(qName.toUpperCase().replace('-', '_'))) {
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
