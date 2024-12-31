const { isEmpty } = require('validator')
const fs = require('fs-extra')

const ValidationError = require('../validation-error')
const fileErrorMessages = require('../errors/file-csv')

module.exports.validate = async (uploadedFile, element) => {
  const validationError = new ValidationError()
  // No File
  if (!uploadedFile || !uploadedFile.file) {
    validationError.addError(element, fileErrorMessages.noFile)
    return validationError
  }
  if (uploadedFile.file.split('.').pop() !== 'csv') {
    validationError.addError(element, fileErrorMessages.noCSVFile)
    return validationError
  }
  // File not readable
  let fileContent, unreadable
  try {
    fileContent = await fs.readFileSync(uploadedFile.file, 'utf8')
  } catch {
    unreadable = true
  }
  if (isEmpty(fileContent) || unreadable) {
    validationError.addError(element, fileErrorMessages.isNotReadable)
  }
  return validationError
}
