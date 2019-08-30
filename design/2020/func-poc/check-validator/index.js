'use strict'

module.exports = function (context, checkToValidate) {
  context.log(`check to validate received ${checkToValidate.checkCode}`)
  context.done()
}
