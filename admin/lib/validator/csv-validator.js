const ValidationError = require('../validation-error')
const addBatchFileErrorMessages = require('../errors/csv-pupil-upload')
const R = require('ramda')
const arrayUtils = require('../array-utils')

const validateHeader = (header) => header[0] === 'Surname' && header[1] === 'Forename' && header[2] === 'Middle name(s)' &&
  header[3] === 'Date of birth' && header[4] === 'Gender' && header[5] === 'UPN'

module.exports.validate = (dataSet, header, element) => {
  const validationError = new ValidationError()
  const errorArr = []
  if (!header || !validateHeader(header)) {
    errorArr.push(addBatchFileErrorMessages.invalidHeader)
  }
  if (dataSet.some(r => r.length !== 6)) {
    errorArr.push(addBatchFileErrorMessages.not6Columns)
  }
  const dataSetCount = countNonEmptyRows(dataSet)
  if (dataSetCount < 2) errorArr.push(addBatchFileErrorMessages.hasOneRow)
  if (dataSetCount >= 300) errorArr.push(addBatchFileErrorMessages.exceedsAllowedRows)
  if (errorArr.length > 0) {
    validationError.addError(element, errorArr)
  }
  return validationError
}

/**
 * Count non-empty lines in the data
 * NB Excel may add several empty lines to CSVs.  This count will ignore them.
 * @param {Array} dataSet Array of Arrays
 * @return {number}
 */
function countNonEmptyRows (dataSet) {
  if (!Array.isArray(dataSet)) {
    throw new Error('dataSet is not an Array')
  }
  return R.reduce((accumulator, data) => {
    if (arrayUtils.isEmptyArray(data)) {
      // Array with nothing in the elements; we expect strings here
      // ['', '', '', '', '', '']
      return accumulator
    }

    return accumulator + 1
  }, 0, dataSet)
}
