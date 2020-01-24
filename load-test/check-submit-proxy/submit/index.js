const lz = require('lz-string')

module.exports = function (context, req) {
  context.log('req.body', JSON.stringify(req.body, null, 2))
  if (req.body) {
    // TODO add answers, audits and inputs...
    const compressed = lz.compressToUTF16(JSON.stringify(req.body))
    const message = {
      version: 2,
      checkCode: req.body.checkCode,
      archive: compressed,
      schoolUUID: req.body.school.uuid
    }
    context.bindings.submittedCheckQueue = [ message ]
    context.done()
  } else {
    badReq(context, 'no body', 400)
    context.done()
  }
}

const badReq = (context, message, statusCode) => {
  context.res = {
    status: statusCode,
    body: message
  }
}
