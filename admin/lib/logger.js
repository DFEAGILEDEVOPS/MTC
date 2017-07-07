const bunyan = require('bunyan')
const azBunyan = require('az-bunyan')

const config = require('../config')

let tableName = 'checkadminlogs'
let loggerName = 'mtcCheckAdminLogger'
let logger = null

if (config.MTC_SERVICE) {
  loggerName = config.MTC_SERVICE
}

if (config.AZURE_STORAGE_LOGGING_ENABLED) {
  // initialize the az-bunyan table storage stream
  let azureStream = azBunyan.createTableStorageStream('info', {
    connectionString: config.AZURE_STORAGE_CONNECTION_STRING,
    tableName: tableName
  })

  logger = bunyan.createLogger({
    name: loggerName,
    serializers: {
      req: bunyan.stdSerializers.req,     // standard bunyan req serializer
      err: bunyan.stdSerializers.err      // standard bunyan error serializer
    },
    streams: [
      {
        level: 'error',
        stream: process.stdout          // Log errors and above to stdout
      },
      azureStream
    ]
  })
} else {
  logger = bunyan.createLogger({
    name: loggerName,
    serializers: {
      req: bunyan.stdSerializers.req,     // standard bunyan req serializer
      err: bunyan.stdSerializers.err      // standard bunyan error serializer
    },
    stream: process.stdout,
    level: 'info'
  })
}

module.exports = logger
