'use strict'
const moment = require('moment')
const ValidationError = require('../validation-error')
const errorConverter = require('../error-converter')
const addPupilErrorMessages = require('../errors/pupil').addPupil
const XRegExp = require('xregexp')
const Pupil = require('../../models/pupil')

const pupilValidationSchema = {
  'foreName': {
    matches: {
      options: [XRegExp('^[\\p{Latin}\-\' 0-9]+$')],
      errorMessage: addPupilErrorMessages.firstNameInvalidCharacters
    },
    notEmpty: true,
    errorMessage: addPupilErrorMessages.firstNameRequired
  },
  'middleNames': {
    optional: true,
    matches: {
      options: [XRegExp('^[\\p{Latin}\-\' 0-9]*$')],
      errorMessage: addPupilErrorMessages.middleNameInvalidCharacters
    }
  },
  'lastName': {
    matches: {
      options: [XRegExp('^[\\p{Latin}\-\' 0-9]+$')],
      errorMessage: addPupilErrorMessages.lastNameInvalidCharacters
    },
    notEmpty: true,
    errorMessage: addPupilErrorMessages.lastNameRequired
  },
  'dob-day': {
    isInt: {
      options: [{min: 1, max: 31}],
      errorMessage: addPupilErrorMessages['dob-day']
    },
    matches: {
      options: [XRegExp('^[0-9]+$')],
      errorMessage: addPupilErrorMessages.dobInvalidChars
    },
    notEmpty: true,
    errorMessage: addPupilErrorMessages.dobRequired
  },
  'dob-month': {
    isInt: {
      options: [{min: 1, max: 12}],
      errorMessage: addPupilErrorMessages['dob-month']
    },
    matches: {
      options: [XRegExp('^[0-9]+$')],
      errorMessage: addPupilErrorMessages.dobInvalidChars
    },
    notEmpty: true,
    errorMessage: addPupilErrorMessages.dobRequired
  },
  'dob-year': {
    isInt: {
      options: [{min: 1900, max: (new Date().getFullYear())}],
      errorMessage: addPupilErrorMessages['dob-year']
    },
    matches: {
      options: [XRegExp('^[0-9]+$')],
      errorMessage: addPupilErrorMessages.dobInvalidChars
    },
    notEmpty: true,
    errorMessage: addPupilErrorMessages.dobRequired
  },
  'gender': {
    matches: {
      options: [/^(M|F)$/],
      errorMessage: addPupilErrorMessages.genderRequired
    }
  },
  'upn': {
    upnHasCorrectCheckLetter: {
      errorMessage: addPupilErrorMessages.upnInvalidCheckDigit
    },
    upnHasValidLaCode: {
      errorMessage: addPupilErrorMessages.upnInvalidLaCode
    },
    upnHasValidChars5To12: {
      errorMessage: addPupilErrorMessages.upnInvalidCharacters5To12
    },
    upnHasValidChar13: {
      errorMessage: addPupilErrorMessages.upnInvalidCharacter13
    },
    notEmpty: true,
    errorMessage: addPupilErrorMessages.upnRequired
  }
}

module.exports.validate = async function (req) {
  let validationError = new ValidationError()
  req.body.foreName = req.body.foreName.trim()
  req.body.lastName = req.body.lastName.trim()
  req.body.upn = req.body.upn.toUpperCase().trim()
  try {
    // expressValidator
    req.checkBody(pupilValidationSchema)
    let result = await req.getValidationResult()
    validationError = errorConverter.fromExpressValidator(result.mapped())
  } catch (error) {
    throw new Error('Failed validation: ' + error.message)
  }

  // We need to run additional tests for the date of birth
  // Use the stict flag when parsing the arguments, otherwise empty inputs could cause the current day / month to be used
  // instead.
  const dob = moment.utc(req.body['dob-day'].padStart(2, '0') + '/' + req.body['dob-month'].padStart(2, '0') + '/' + req.body['dob-year'], 'DD/MM/YYYY', true)
  if (dob.isValid()) {
    if (dob > moment().toDate()) {
      validationError.addError('dob-day', addPupilErrorMessages.dobNoFuture)
      validationError.addError('dob-month', addPupilErrorMessages.dobNoFuture)
      validationError.addError('dob-year', addPupilErrorMessages.dobNoFuture)
    }
  } else {
    // Invalid
    // We need to specify a different error messages if fields have the wrong number of digits
    if (/^\d{3,}$/.test(req.body['dob-day'])) {
      validationError.addError('dob-day', addPupilErrorMessages['dob-day'])
    }
    if (/^\d{3,}$/.test(req.body['dob-month'])) {
      validationError.addError('dob-month', addPupilErrorMessages['dob-month'])
    }
    if (!(validationError.isError('dob-day') || validationError.isError('dob-month') || validationError.isError('dob-year'))) {
      validationError.addError('dob-day', addPupilErrorMessages['dob-day'])
      validationError.addError('dob-month', addPupilErrorMessages['dob-month'])
      validationError.addError('dob-year', addPupilErrorMessages['dob-year'])
    }
  }

  // We need to check that the UPN is unique
  if (!(validationError.get('upn'))) {
    const pupil = await Pupil.findOne({upn: req.body.upn}).exec()
    if (pupil && pupil._id.toString() !== req.body._id) {
      validationError.addError('upn', addPupilErrorMessages.upnDuplicate)
    }
  }

  return validationError
}
