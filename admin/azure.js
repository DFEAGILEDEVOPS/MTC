// identify azure by specific environment variable
function isAzure () {
  return process.env.KUDU_APPPATH
}

module.exports = {
  isAzure: isAzure
}
