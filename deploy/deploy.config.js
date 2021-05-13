'use strict'
const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '.env')

try {
  if (fs.existsSync(globalDotEnvFile)) {
    require('dotenv').config({ path: globalDotEnvFile })
  } else {
    console.log('No .env file found at project root')
  }
} catch (error) {
  console.error(error)
}

const fiveGigabytes = 5120
// for reference...
// const fourtyGigabytes = 40960
// const eightyGigabytes = 81920
const fourteenDays = 'P14D'
const fiveMinutes = 'PT5M'
const oneDay = 'P1D'
const sixDays = 'P6D'

module.exports = {
  ServiceBus: {
    QueueDefaults: {
      MaxSizeInMegabytes: fiveGigabytes,
      DefaultMessageTimeToLive: fourteenDays,
      LockDuration: fiveMinutes,
      RequiresDuplicateDetection: true,
      DeadLetteringOnMessageExpiration: true,
      DuplicateDetectionHistoryTimeWindow: oneDay,
      EnablePartitioning: false,
      RequiresSession: false
    },
    Queues: [
      {
        name: 'check-completion'
      },
      {
        name: 'check-marking'
      },
      {
        name: 'check-notification'
      },
      {
        name: 'check-sync'
      },
      {
        name: 'check-validation'
      },
      {
        name: 'ps-report-schools',
        DefaultMessageTimeToLive: sixDays,
        MaxSizeInMegabytes: {}.hasOwnProperty.call(process.env, 'SERVICE_BUS_QUEUE_MAX_SIZE_PS_REPORT') ? parseInt(process.env.SERVICE_BUS_QUEUE_MAX_SIZE_PS_REPORT, 10) : fiveGigabytes
      },
      {
        name: 'ps-report-staging',
        DefaultMessageTimeToLive: sixDays,
        MaxSizeInMegabytes: {}.hasOwnProperty.call(process.env, 'SERVICE_BUS_QUEUE_MAX_SIZE_PS_REPORT') ? parseInt(process.env.SERVICE_BUS_QUEUE_MAX_SIZE_PS_REPORT, 10) : fiveGigabytes
      },
      {
        name: 'ps-report-export',
        DefaultMessageTimeToLive: sixDays,
        MaxSizeInMegabytes: {}.hasOwnProperty.call(process.env, 'SERVICE_BUS_QUEUE_MAX_SIZE_PS_REPORT') ? parseInt(process.env.SERVICE_BUS_QUEUE_MAX_SIZE_PS_REPORT, 10) : fiveGigabytes
      },
      {
        name: 'pupil-login'
      },
      {
        name: 'school-results-cache'
      },
      {
        name: 'sync-results-to-db-complete'
      }
    ]
  }
}
