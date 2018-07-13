module.exports = function (context, checkStartMessage) {
  context.log('JavaScript queue trigger function processed work item', checkStartMessage)
  context.done()
}
