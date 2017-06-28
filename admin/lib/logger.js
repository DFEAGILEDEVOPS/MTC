const bunyan = require('bunyan');
const azBunyan = require('az-bunyan');

let tableName = 'checkadminlogs';
let loggerName = 'mtcCheckAdminLogger';
let logger = null;

if (process.env.MTC_SERVICE) {
  loggerName = process.env.MTC_SERVICE;
}

if (process.env.AZURE_STORAGE_LOGGING_ENABLED) {
  // initialize the az-bunyan table storage stream
  let azureStream = azBunyan.createTableStorageStream('info', {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    tableName: tableName
  });

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
  });
} else {
  logger = bunyan.createLogger({
    name: loggerName,
    serializers: {
      req: bunyan.stdSerializers.req,     // standard bunyan req serializer
      err: bunyan.stdSerializers.err      // standard bunyan error serializer
    },
    stream: process.stdout,
    level: 'info'
  });
}

module.exports = logger;