'use strict'

module.exports.addPupil = {
  'genderRequired': 'Gender must be M or F',

  'firstNameRequired': 'First name can\'t be blank and can\'t contain more than 128 characters',
  'firstNameInvalidCharacters': 'First name can\'t contain special character',

  'middleNameMaxLengthExceeded': 'Middle name can\'t contain more than 128 characters',
  'middleNameInvalidCharacters': 'Check the middle name does not contain special characters',

  'lastNameRequired': 'Last name can\'t be blank and can\'t contain more than 128 characters',
  'lastNameInvalidCharacters': 'Last name can\'t contain special characters',

  'dobNoFuture': 'Date of birth can\'t be in the future',
  'dobRequired': 'Date of birth can\'t be blank',
  'dobInvalidChars': 'Entry must be a number',
  'dob-day': 'Enter a valid day for date of birth',
  'dob-month': 'Enter a valid month for date of birth',
  'dob-year': 'Enter a valid year for date of birth',

  'upnRequired': 'UPN is missing',
  'upnInvalidCheckDigit': 'UPN invalid (wrong check letter at character 1)',
  'upnDuplicate': 'UPN is a duplicate of a pupil already in your register',
  'upnDuplicateInFile': 'Enter a valid UPN. This one is a duplicate of another UPN in the spreadsheet',
  'upnInvalidLaCode': 'UPN invalid (characters 2-4 not a recognised LA code)',
  'upnInvalidCharacters5To12': 'UPN invalid (characters 5-12 not all numeric)',
  'upnInvalidCharacter13': 'UPN invalid (character 13 not a recognised value)'
}
