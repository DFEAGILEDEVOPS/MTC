'use strict'
const winston = require('winston')

const pupilLogonEventDataService = require('./data-access/pupil-logon-event.data.service')

const pupilLogonEventService = {}

/**
 * Store an attempted logon event by a pupil.
 * NB: this method will not throw
 * @param schoolPin
 * @param pupilPin
 * @param isAuthenticated
 * @param httpStatusCode
 * @param httpErrorMessage
 * @return {Promise<boolean>}
 */
pupilLogonEventService.storeLogonEvent = async function (pupilId, schoolPin, pupilPin, isAuthenticated, httpStatusCode, httpErrorMessage = null) {
  try {
    const data = {
      pupilPin: trimLength(50, '...', pupilPin),
      schoolPin: trimLength(50, '...', schoolPin),
      isAuthenticated: isAuthenticated,
      httpStatusCode: parseInt(httpStatusCode, 10)
    }
    if (httpErrorMessage) {
      data.httpErrorMessage = httpErrorMessage
    }
    if (pupilId) {
      data.pupil_id = pupilId
    }
    await pupilLogonEventDataService.sqlCreate(data)
  } catch (error) {
    winston.warn('Failed to log a pupil logon attempt', error)
    return false
  }
  return true
}

// Return a string truncated to `size` with a truncation indicator (if truncation occurred)
function trimLength (size, truncationIndicator, string = '') {
  if (string.length <= size) {
    return string
  }
  return string.slice(0, size - truncationIndicator.length).concat(truncationIndicator)
}

module.exports = pupilLogonEventService
