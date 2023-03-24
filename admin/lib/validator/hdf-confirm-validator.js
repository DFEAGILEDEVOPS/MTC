'use strict'

const ValidationError = require('../validation-error')
const hdfConfirmErrorMessages = require('../errors/hdf-confirm')
const confirmOptions = require('../../lib/consts/hdf-confirm-options')

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
    disruptionConfirm,
    noPupilsFurtherInfo
  } = hdfConfirmData

  if (confirm === undefined) {
    validationError.addError('noSelection', hdfConfirmErrorMessages.noSelection)
  }

  if (confirm === confirmOptions.confirmAll && (pupilDetails !== 'checked' || uniquePins !== 'checked' ||
    staffConfirm !== 'checked' || disruptionConfirm !== 'checked')) {
    validationError.addError('confirmBoxes', hdfConfirmErrorMessages.confirmBoxes)
  }

  if (confirm === confirmOptions.confirmNo && (noPupilsFurtherInfo === undefined | noPupilsFurtherInfo === '')) {
    validationError.addError('noConfirmSection', hdfConfirmErrorMessages.noConfirmInfo)
  }

  return validationError
}
