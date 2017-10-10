const ValidationError = require('../validation-error')
const addBatchFileErrorMessages = require('../errors/csv-pupil-upload')

module.exports.validate = (dataSet) => {
  const validationError = new ValidationError()
  const errorArr = []
  dataSet.map(r => {
    if (r.length !== 6) {
      errorArr.push(addBatchFileErrorMessages.not6Columns)
    }
  })
  if (dataSet.length < 2) errorArr.push(addBatchFileErrorMessages.hasOneRow)
  if (errorArr.length > 0) {
    validationError.addError('template-upload', errorArr)
  }
  return validationError
}
