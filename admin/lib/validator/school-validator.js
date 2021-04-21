const laCodeValidator = require('./la-code-validator')
const ValidationError = require('../validation-error')

const schoolValidator = {
  /**
   * @typedef editableSchoolDetails
   * {
   *   dfeNumber: number,
   *   estabCode: number,
   *   leaCode: number,
   *   name: string,
   *   urn: number
   * }
   */

  /**
   * Validate the editable school details
   * @param {editableSchoolDetails} school
   * @return {Promise<ValidationError>}
   */
  validate: async function validateSchool (school) {
    const validationError = new ValidationError()

    if (school.name === undefined || school.name.length < 1) {
      validationError.addError('name', 'School name is too short')
    }
    if (typeof school.dfeNumber !== 'number') {
      validationError.addError('dfeNumber', `Invalid dfeNumber: ${school.dfeNumber}`)
    }
    if (typeof school.urn !== 'number') {
      validationError.addError('urn', `Invalid URN: ${school.urn}`)
    }
    if (typeof school.leaCode !== 'number') {
      validationError.addError('leaCode', `Invalid LEA code: ${school.leaCode}`)
    }
    if (typeof school.estabCode !== 'number') {
      validationError.addError('estabCode', `Invalid Estab code: ${school.estabCode}`)
    }
    const laCodeValidationError = await laCodeValidator.validate(school.leaCode, 'leaCode')
    if (laCodeValidationError.hasError()) {
      if (!validationError.isError('leaCode')) {
        validationError.addError('leaCode', `Unknown LEA code: ${school.leaCode}`)
      }
    }
    return validationError
  }
}

module.exports = schoolValidator
