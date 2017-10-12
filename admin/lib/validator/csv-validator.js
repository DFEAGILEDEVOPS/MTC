const ValidationError = require('../validation-error')
const addBatchFileErrorMessages = require('../errors/csv-pupil-upload')

const validateHeader = (header) => header[0] === 'First name' && header[1] === 'Middle name(s)' && header[2] === 'Last name' &&
  header[3] === 'UPN' && header[4] === 'Date of Birth' && header[5] === 'Gender'

module.exports.validate = (dataSet, header, element) => {
  const validationError = new ValidationError()
  const errorArr = []
  if (!header || !validateHeader(header)) {
    errorArr.push(addBatchFileErrorMessages.invalidHeader)
  }
  const upnList = []
  dataSet.map(r => {
    if (r.length !== 6) {
      errorArr.push(addBatchFileErrorMessages.not6Columns)
    }
    upnList.push(r[3])
  })
  if (upnList.some((val, i) => upnList.indexOf(val) !== i)) {
    errorArr.push(addBatchFileErrorMessages.duplicateUPN)
  }
  if (dataSet.length < 2) errorArr.push(addBatchFileErrorMessages.hasOneRow)
  if (errorArr.length > 0) {
    validationError.addError(element, errorArr)
  }
  return validationError
}
