'use strict'
const checkWindowErrorMessages = require('../../errors/check-window-v2')
const { isEmpty } = require('validator')

/**
 * Validates check window data for first submission
 * @param {Object} validationError
 * @param {String} checkWindowName
 */
module.exports.validate = (validationError, checkWindowName) => {
  const CheckWindowNameValue = checkWindowName.trim()
  if (isEmpty(CheckWindowNameValue) || CheckWindowNameValue.length < 2 || CheckWindowNameValue.length > 35) {
    validationError.addError('checkWindowName', checkWindowErrorMessages.checkWindowNameLength)
  }
}
