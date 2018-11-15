'use strict'

module.exports = function (context, myTimer) {
  const timeStamp = new Date().toISOString()
  context.log('Node timer trigger function ran!', timeStamp)
  context.done()
}
