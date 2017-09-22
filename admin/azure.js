let appInsights = require('applicationinsights')

// identify azure by specific environment variable
function isAzure () {
  return process.env.KUDU_APPPATH
}

function applicationInsights () {
  if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    appInsights.setup().start()
  }
}

module.exports = {
  isAzure: isAzure,
  startInsightsIfConfigured: applicationInsights
}
