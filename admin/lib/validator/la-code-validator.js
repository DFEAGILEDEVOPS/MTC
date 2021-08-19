const laCodeService = require('../../services/la-code.service')
const ValidationError = require('../validation-error')

const laCodeValidator = {
  /**
   * Validate a Local Authority code is in our list of known codes
   * @param {number} code - the la code to validate
   * @param {string} domId - the id field of the DOM element in the browser that the validation message pertains to
   * @return {Promise<ValidationError>}
   */
  validate: async function validateLaCode (code, domId) {
    const validationError = new ValidationError()
    const validLaCodes = await laCodeService.getLaCodes()
    if (!validLaCodes.includes(code)) {
      validationError.addError(domId, 'Unknown LA Code ' + encodeURIComponent(code))
    }
    return validationError
  }
}

module.exports = laCodeValidator
