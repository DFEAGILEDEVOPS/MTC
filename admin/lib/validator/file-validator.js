const ValidationError = require('../validation-error')
const addBatchFileErrorMessages = require('../errors/file')
const { isEmpty } = require('validator')
const fs = require('fs-extra')

module.exports.validate = async (uploadedFile) => {
  let validationError = new ValidationError()
  // No
  if (!uploadedFile) {
    validationError.addError('template-upload', addBatchFileErrorMessages.noFile)
    return validationError
  }
  // File not readable
  let fileContent, unreadable
  try {
    fileContent = await fs.readFileSync(uploadedFile.file, 'utf8')
  } catch (err) {
    unreadable = true
  }
  if (isEmpty(fileContent) || unreadable) {
    validationError.addError('template-upload', addBatchFileErrorMessages.isNotReadable)
    return validationError
  }
  const errorArr = []
  // Only 1 file row
  const fileLines = fileContent.split('\n')
  if (fileLines.length < 3) {
    errorArr.push(addBatchFileErrorMessages.hasOneRow)
  }
  // File columns are not as expected
  const commaCount = []
  fileLines.map((l) => commaCount.push(l.match(/,/g).length))
  // Columns can be either 6 or 7 in case of error column being uploaded
  if (commaCount.some(c => c !== 5 && c !== 6)) {
    errorArr.push(addBatchFileErrorMessages.not5Columns)
  }
  // File lines do not have ending special characters
  const clone = Array.from(fileLines)
  // Remove last line since it won't have special characters
  clone.pop()
  if (clone.some((l) => l.indexOf('\r') < 1)) {
    errorArr.push(addBatchFileErrorMessages.noRowLineFeed)
  }
  if (errorArr.length > 0) validationError.addError('template-upload', errorArr)
  return validationError
}
