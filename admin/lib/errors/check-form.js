'use strict'

const config = require('../../config')

module.exports = {
  checkFormNameMaxLength: `must contain no more than ${config.CHECK_FORM_NAME_MAX_CHARACTERS} characters in name`,
  duplicateCheckFormName: 'already exists. Rename and upload again',
  familiarisationFormAssigned: 'Try it out form is already assigned to a check window',
  isNotReadable: 'can\'t be read',
  invalidNumberOfItems: `must contain exactly ${config.LINES_PER_CHECK_FORM} items`,
  invalidNumberOfTotalQuestionFactors: `must contain exactly ${config.LINES_PER_CHECK_FORM * 2} integers`,
  invalidIntegers: `must only contain numbers ${config.CHECK_FORM_MIN_INTEGER} to ${config.CHECK_FORM_MAX_INTEGER}`,
  invalidNumberOfColumns: 'must contain exactly 2 columns',
  invalidFileCharacters: 'Check file format for',
  maxUploadedFiles: 'Select a maximum of 10 files to upload at a time',
  missingCheckFormType: 'Select try it out form or MTC form',
  multipleFamiliarisationForms: 'Select one try it out form for upload',
  noFile: 'Select a file to upload',
  wrongFormat: 'must be a CSV file'
}
