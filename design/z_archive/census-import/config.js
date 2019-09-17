'use strict'

require('dotenv').config()

module.exports = {
  Logging: {
    LogLevel: process.env.LOG_LEVEL || 'info',
    SendToAppInsights: process.env.APPINSIGHTS_WINSTON_LOGGER || false
  },
  Monitoring: {
    ApplicationInsights: {
      Key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
      CollectDependencies: process.env.APPINSIGHTS_COLLECT_DEPS || true,
      CollectExceptions: process.env.APPINSIGHTS_COLLECT_EXCEPTIONS || true
    }
  }
}
