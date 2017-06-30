'use strict'

const ValidationError = require('./validation-error')

module.exports = class ErrorConverter {
  /**
   *
   * @param mongooseError
   * @param errorMessages - key/val object to replace the mongoose error messages with user-friendly ones
   * @param validationError - optional
   * @return {ValidationError} - returns a new ValidationError
   */
  static fromMongoose (mongooseError, errorMessages, validationError) {
    if (!mongooseError) {
      throw new TypeError('mongooseError is not defined')
    }

    if (!(typeof mongooseError === 'object' && mongooseError.name === 'ValidationError' &&
        mongooseError.hasOwnProperty('errors'))) {
      throw new TypeError('mongooseError must be an instanceof MongooseError')
    }

    if (validationError && !(validationError instanceof ValidationError)) {
      throw new TypeError('validationError must be an instanceof ValidationError')
    }

    let newValidationError = new ValidationError()

    for (let error in mongooseError.errors) {
      let fieldError = mongooseError.errors[error]
      let message = errorMessages[error] ? errorMessages[error] : fieldError.message
      newValidationError.addError(fieldError.path, message)
    };

    if (validationError && validationError.errors) {
      for (let field in validationError.errors) {
        newValidationError.addError(field, validationError.get(field))
      }
    }

    return newValidationError
  }

  /**
   *
   * @param $params - data structure from calling .mapped() on the express validator result
   * @return {*}
   *
   * params = {
   *  field: {
   *    param: field,
   *    msg: "some message about the error"
   *    value: <some val>
   *  }, ...
   * }
   *
   */
  static fromExpressValidator (params) {
    let validationError = new ValidationError()
    for (let field in params) {
      validationError.addError(params[field].param, params[field].msg)
    }
    return validationError
  }
}
