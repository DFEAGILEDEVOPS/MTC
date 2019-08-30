'use strict'

const v1 = {
  process: async function (context, checkToValidate) {
    // TODO validation
    const message = {
      checkCode: checkToValidate.checkCode,
      schoolUUID: checkToValidate.schoolUUID
    }
    context.bindings.checkMarkingQueue = [message]
  }
}

module.exports = v1
