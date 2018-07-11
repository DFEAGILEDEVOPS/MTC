module.exports = function (context, check) {
  context.log('message received')
  context.log('check code:', check.access_token)
  context.done()
}
