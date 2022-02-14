'use strict'

const ValidationError = require('../validation-error')
const hdfConfirmErrorMessages = require('../errors/hdf-confirm')

/**
 * Validates HDF confirmation data
 * @param {Object} hdfConfirmData
 * @returns {Object}
 */
module.exports.validate = function (hdfConfirmData) {
  const validationError = new ValidationError()
  const {
    confirm,
    pupilDetails,
    uniquePins,
    staffConfirm,
    disruptionConfirm
  } = hdfConfirmData

  if (confirm === 'Y' && (pupilDetails !== 'checked' || uniquePins !== 'checked' ||
    staffConfirm !== 'checked' || disruptionConfirm !== 'checked')) {
    validationError.addError('confirmBoxes', hdfConfirmErrorMessages.confirmBoxes)
  }

  return validationError
}
