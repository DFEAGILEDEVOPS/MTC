const csv = require('fast-csv')
const fs = require('fs-extra')
const path = require('path')

const checkFormErrorMessages = require('../../errors/check-form')
const config = require('../../../config')

const singleCheckFormValidator = {}

/**
 * Single check form data validation
 * @param {Object} uploadedFile
 * @returns {Promise<Array<String>>} list of errors
 */
singleCheckFormValidator.validate = async (uploadedFile) => {
  let fileBuffer
  const csvErrors = []
  // No file provided
  if (!uploadedFile || !uploadedFile.filename) {
    csvErrors.push(checkFormErrorMessages.noFile)
    return csvErrors
  }
  // Fetch file name without extension
  const checkFormName = uploadedFile.filename.replace(/\.[^/.]+$/, '')
  // File type not CSV
  if (path.extname(uploadedFile.filename.toLowerCase()) !== '.csv') {
    csvErrors.push(`${checkFormName} ${checkFormErrorMessages.wrongFormat}`)
  }
  // File name longer than max allowed characters
  if (checkFormName.length > config.CHECK_FORM_NAME_MAX_CHARACTERS) {
    csvErrors.push(`${checkFormName} ${checkFormErrorMessages.checkFormNameMaxLength}`)
  }
  // File not readable
  try {
    fileBuffer = fs.readFileSync(uploadedFile.file, 'utf8')
  } catch {
    csvErrors.push(`${checkFormName} ${checkFormErrorMessages.isNotReadable}`)
    return csvErrors
  }
  const fileContent = fileBuffer && fileBuffer.toString().trim()
  const fileLines = fileContent && fileContent.split('\n').length
  // Invalid total file lines
  const linesPerCheckForm = config.LINES_PER_CHECK_FORM

  if (fileLines !== linesPerCheckForm) {
    csvErrors.push(`${checkFormName} ${checkFormErrorMessages.invalidNumberOfItems}`)
  }
  let hasInvalidNumberOfColumns = false
  let hasInvalidIntegers = false
  let hasInvalidFileCharacters = false
  let checkFormIntegerCount = 0
  await new Promise((resolve, reject) => {
    csv.parseString(fileContent, { headers: false, trim: true })
      .validate((row) => {
        // Invalid column count
        if (row.length !== 2) {
          hasInvalidNumberOfColumns = true
        }
        // Invalid integers
        if (row && row[0] && row[1] &&
          (row[0] < config.CHECK_FORM_MIN_INTEGER || row[0] > config.CHECK_FORM_MAX_INTEGER ||
            row[1] < config.CHECK_FORM_MIN_INTEGER || row[1] > config.CHECK_FORM_MAX_INTEGER)) {
          hasInvalidIntegers = true
        }
        // Invalid characters
        if ((!row[0] || row[0].match(/[^0-9]/)) || (!row[1] || row[1].match(/[^0-9]/))) {
          hasInvalidFileCharacters = true
        }
        checkFormIntegerCount += row.length
      })
      .on('data', () => {})
      .on('end', () => resolve()
      )
      .on('error', error => reject(error)
      )
  })
  if (hasInvalidNumberOfColumns) {
    csvErrors.push(`${checkFormName} ${checkFormErrorMessages.invalidNumberOfColumns}`)
  }
  if (hasInvalidIntegers) {
    csvErrors.push(`${checkFormName} ${checkFormErrorMessages.invalidIntegers}`)
  }
  if (hasInvalidFileCharacters) {
    csvErrors.push(`${checkFormErrorMessages.invalidFileCharacters} ${checkFormName}`)
  }
  if (checkFormIntegerCount !== (config.LINES_PER_CHECK_FORM * 2)) {
    csvErrors.push(`${checkFormName} ${checkFormErrorMessages.invalidNumberOfTotalQuestionFactors}`)
  }
  return csvErrors
}

module.exports = singleCheckFormValidator
