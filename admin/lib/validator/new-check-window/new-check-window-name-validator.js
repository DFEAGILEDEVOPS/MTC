'use strict'
const checkWindowErrorMessages = require('../../errors/new-check-window')
const { isEmpty } = require('validator')

/**
 * Validates check window data for first submission
 * @param {Object} validationError
 * @param {String} checkWindowName
 */
module.exports.validate = (validationError, checkWindowName) => {
  if (isEmpty(checkWindowName.trim()) || checkWindowName.length < 2 || checkWindowName.length > 35) {
    validationError.addError('checkWindowName', checkWindowErrorMessages.checkWindowNameLength)
  }
}
