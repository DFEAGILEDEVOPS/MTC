'use strict'

module.exports = async function (context, check) {
  context.log(`redirecting poison check message back to complete-check queue for check ${check.checkCode}`)
  context.bindings.completedCheckQueue = [check]
  context.done()
}
