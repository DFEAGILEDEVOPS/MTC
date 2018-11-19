'use strict'

module.exports = async function (context, message) {
  context.log(
    `pupil-login: processing message version:${message.version} for check:${message.checkCode}`
  )
  context.done()
}
