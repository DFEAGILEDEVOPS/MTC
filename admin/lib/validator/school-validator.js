const laCodeValidator = require('./la-code-validator')
const ValidationError = require('../validation-error')

const schoolValidator = {
  /**
   * @typedef editableSchoolDetails
   * @property {number} dfeNumber,
   * @property {number} estabCode,
   * @property {number} leaCode,
   * @property {string} name,
   * @property {number} urn,
   * @property {number} typeOfEstablishmentCode
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
    } else if (isNaN(school.dfeNumber)) {
      validationError.addError('dfeNumber', 'Please enter a DFE number')
    }

    if (typeof school.urn !== 'number') {
      validationError.addError('urn', `Invalid URN: ${school.urn}`)
    } else if (isNaN(school.urn)) {
      validationError.addError('urn', 'Please enter a URN')
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

    if (typeof school.typeOfEstablishmentCode !== 'number') {
      validationError.addError('typeOfEstablishmentCode', `Invalid Type Of Establishment code: ${school.typeOfEstablishmentCode}`)
    } else if (isNaN(school.typeOfEstablishmentCode)) {
      validationError.addError('typeOfEstablishmentCode', 'Please choose one of the establishment types')
    }

    if (school.typeOfEstablishmentCode === 0) {
      validationError.addError('typeOfEstablishmentCode', 'Please choose one of the establishment types')
    }

    return validationError
  }
}

module.exports = schoolValidator
