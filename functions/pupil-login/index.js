'use strict'

module.exports = async function (context, message) {
  context.log(
    `processing pupil-login message version:${message.version} for check:${message.checkCode}`
  )
  context.done()
}
