'use strict'

const v1 = require('./v1')

module.exports = async function (context, message) {
  await v1.process(context, message)
}
