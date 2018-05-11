const ValidationError = require('../validation-error')
const addBatchFileErrorMessages = require('../errors/csv-pupil-upload')

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
  if (dataSet.length < 2) errorArr.push(addBatchFileErrorMessages.hasOneRow)
  if (dataSet.length >= 300) errorArr.push(addBatchFileErrorMessages.exceedsAllowedRows)
  if (errorArr.length > 0) {
    validationError.addError(element, errorArr)
  }
  return validationError
}
