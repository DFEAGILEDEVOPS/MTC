'use strict'
const moment = require('moment')
const ValidationError = require('../validation-error')
const errorConverter = require('../error-converter')
const addPupilErrorMessages = require('../errors/pupil').addPupil
const XRegExp = require('xregexp')

const pupilValidationSchema = {
  'foreName': {
    notEmpty: true,
    isLength: {
      options: [{min: 1, max: 35}]
    },
    matches: {
      options: [ XRegExp('^[\\p{Latin}\-\'0-9]+$') ]
    },
    errorMessage: addPupilErrorMessages.foreName
  },
  'middleNames': {
    optional: true,
    isLength: {
      options: [{max: 35}]
    },
    matches: {
      options: [ XRegExp('^[\\p{Latin}\-\' 0-9]*$') ]
    },
    errorMessage: addPupilErrorMessages.middleNames
  },
  'lastName': {
    notEmpty: true,
    isLength: {
      options: [{min: 1, max: 35}]
    },
    matches: {
      options: [ XRegExp('^[\\p{Latin}\-\'0-9]+$') ]
    },
    errorMessage: addPupilErrorMessages.lastName
  },
  'dob-day': {
    notEmpty: true,
    isInt: {
      options: [{min: 1, max: 31}]
    },
    errorMessage: addPupilErrorMessages['dob-day']
  },
  'dob-month': {
    notEmpty: true,
    isInt: {
      options: [{min: 1, max: 12}]
    },
    errorMessage: addPupilErrorMessages['dob-month']
  },
  'dob-year': {
    notEmpty: true,
    isInt: {
      options: [{min: 1900, max: (new Date().getFullYear())}]
    },
    errorMessage: addPupilErrorMessages['dob-year']
  }
}

module.exports.validate = function (req) {
  return new Promise(async function (resolve, reject) {
    let validationError = new ValidationError()
    try {
      // expressValidator
      req.checkBody(pupilValidationSchema)
      let result = await req.getValidationResult()
      validationError = errorConverter.fromExpressValidator(result.mapped())
    } catch (error) {
      return reject(error)
    }

    // There is no point running these tests if the previous ones failed - it guaranteed to be
    // a fail and by setting the error to all dob fields it produces less specific output
    // for the user.
    const dob = moment.utc('' + req.body['dob-day'] + '/' + req.body['dob-month'] + '/' + req.body['dob-year'], 'DD/MM/YYYY')
    if (dob.isValid()) {
      if (dob > moment().toDate()) {
        validationError.addError('dob-year', addPupilErrorMessages['dob-year'])
      }
    } else {
      if (!(validationError.isError('dob-day') || validationError.isError('dob-month') || validationError.isError('dob-year'))) {
        validationError.addError('dob-day', addPupilErrorMessages['dob-day'])
        validationError.addError('dob-month', addPupilErrorMessages['dob-month'])
        validationError.addError('dob-year', addPupilErrorMessages['dob-year'])
      }
    }
    resolve(validationError)
  })
}
