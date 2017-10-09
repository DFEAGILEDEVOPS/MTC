'use strict'

module.exports.addPupil = {
  'genderRequired': 'Select a gender',

  'firstNameRequired': 'First name can\'t be blank',
  'firstNameLength': 'First name can\'t be blank',
  'firstNameInvalidCharacters': 'Check the first name does not contain special characters',

  'middleNameMaxLengthExceeded': 'Middle name can\'t contain more than 128 characters',
  'middleNameInvalidCharacters': 'Check the middle name does not contain special characters',

  'lastNameRequired': 'Last name can\'t be blank',
  'lastNameLength': 'Last name can\'t be blank',
  'lastNameInvalidCharacters': 'Check last name for special characters',

  'dobNoFuture': 'Date of birth can\'t be in the future',
  'dobRequired': 'Date of birth can\'t be blank',
  'dobInvalidChars': 'Entry must be a number',
  'dob-day': 'Please check "Day"',
  'dob-month': 'Please check "Month"',
  'dob-year': 'Please check "Year"',

  'upnRequired': 'UPN is missing',
  'upnInvalidCheckDigit': 'UPN invalid (wrong check letter at character 1)',
  'upnDuplicate': 'More than 1 pupil record with same UPN',
  'upnInvalidLaCode': 'UPN invalid (characters 2-4 not a recognised LA code)',
  'upnInvalidCharacters5To12': 'UPN invalid (characters 5-12 not all numeric)',
  'upnInvalidCharacter13': 'UPN invalid (character 13 not a recognised value)'
}
