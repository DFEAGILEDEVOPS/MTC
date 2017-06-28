'use strict';
const ValidationError = require('../validation-error');
const errorConverter = require('../error-converter');
const hdfErrorMessages = require('../errors/hdf');
const XRegExp = require('xregexp');

const hdfValidationSchema = {
  'declaration': {
    notEmpty: true,
    errorMessage: hdfErrorMessages.declaration
  },
  'jobTitle': {
    notEmpty: true,
    isLength: {
      options: [{min: 1, max: 35}]
    },
    errorMessage: hdfErrorMessages.jobTitle
  },
  'fullName': {
    notEmpty: true,
    isLength: {
      options: [{min: 1, max: 35}]
    },
    errorMessage: hdfErrorMessages.fullName
  }
};

module.exports.validate = function (req) {
  return new Promise(async function(resolve, reject) {
    let validationError = new ValidationError;
    try {
      // expressValidator
      req.checkBody(hdfValidationSchema);
      let result = await req.getValidationResult();
      validationError = errorConverter.fromExpressValidator(result.mapped());
    } catch (error) {
      return reject(error);
    }
    resolve(validationError);
  });
};
