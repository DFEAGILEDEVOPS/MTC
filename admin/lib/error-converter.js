'use strict'

const ValidationError = require('./validation-error')

module.exports = class ErrorConverter {
  /**
   *
   * @param params - data structure from calling .mapped() on the express validator result
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
