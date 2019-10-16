'use strict'

module.exports.addPupil = {
  genderRequired: 'Enter a gender as M or F',

  firstNameRequired: 'Enter a first name in no more than 128 characters',
  firstNameInvalidCharacters: 'Enter a first name without special characters',

  middleNameMaxLengthExceeded: 'Enter a middle name in no more than 128 characters',
  middleNameInvalidCharacters: 'Enter a middle name without special characters',

  lastNameRequired: 'Enter a last name in no more than 128 characters',
  lastNameInvalidCharacters: 'Enter a last name without special characters',

  dobRequired: 'Enter a date of birth',
  dobInvalidChars: 'Enter a date of birth in the specified format',
  dobOutOfRange: 'Enter a valid date of birth',
  dobMultipleRequiresReason: 'Enter a valid date of birth. If pupil is outside expected age range, use add single pupil function',
  'dob-day': 'Enter a valid day',
  'dob-month': 'Enter a valid month',
  'dob-year': 'Enter a valid year',

  upnRequired: 'Enter a UPN',
  upnInvalidCheckDigit: 'Enter a valid UPN. First character is not recognised. See guidance for instructions.',
  upnDuplicate: 'Enter a valid UPN. This one is already in use. Contact the Helpdesk on 0300 303 3013 for guidance.',
  upnDuplicateInFile: 'Enter a valid UPN. This one is a duplicate of another UPN in the spreadsheet. Contact the Helpdesk on 0300 303 3013 for guidance.',
  upnInvalidLaCode: 'Enter a valid UPN. Characters 2-4 are not a recognised LA code. See guidance for instructions.',
  upnInvalidCharacters5To12: 'Enter a valid UPN. Characters 5-12 must be numeric. See guidance for instructions.',
  upnInvalidCharacter13: 'Enter a valid UPN. Character 13 not recognised. See guidance for instructions.',

  ageReasonLength: 'Enter a reason'
}
