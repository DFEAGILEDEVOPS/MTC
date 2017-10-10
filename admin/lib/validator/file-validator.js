const ValidationError = require('../validation-error')
const fileErrorMessages = require('../errors/file-csv')
const { isEmpty } = require('validator')
const fs = require('fs-extra')

module.exports.validate = async (uploadedFile) => {
  let validationError = new ValidationError()
  // No File
  if (!uploadedFile) {
    validationError.addError('template-upload', fileErrorMessages.noFile)
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
    validationError.addError('template-upload', fileErrorMessages.isNotReadable)
  }
  return validationError
}
