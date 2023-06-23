'use strict'

const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '..', '.env')

try {
  if (fs.existsSync(globalDotEnvFile)) {
    // console.log('globalDotEnvFile found', globalDotEnvFile)
    require('dotenv').config({ path: globalDotEnvFile })
  } else {
    console.log('No .env file found at project root')
  }
} catch (error) {
  console.error(error)
}

const R = require('ramda')

// constants for service bus options...
const oneGigabyte = 1024
const fiveGigabytes = 5120
const twentyGigabytes = 20480
const fourtyGigabytes = 40960
const eightyGigabytes = 81920
const fourteenDays = 'P14D'
const oneHundredAndTwentyDays = 'P120D'
const fiveMinutes = 'PT5M'
const oneDay = 'P1D'
const sixDays = 'P6D'
const twentyThreeHours = 'PT23H'
const sixHours = 'PT6H'

const config = {
  QueueDefaults: {
    maxSizeInMegabytes: {}.hasOwnProperty.call(process.env, 'SERVICE_BUS_QUEUE_MAX_SIZE_DEFAULT_MEGABYTES') ? parseInt(process.env.SERVICE_BUS_QUEUE_MAX_SIZE_DEFAULT_MEGABYTES, 10) : fiveGigabytes,
    defaultMessageTimeToLive: oneHundredAndTwentyDays,
    lockDuration: fiveMinutes,
    requiresDuplicateDetection: true,
    deadLetteringOnMessageExpiration: true,
    duplicateDetectionHistoryTimeWindow: oneDay,
    enablePartitioning: false,
    requiresSession: false
  },
  Queues: [
    {
      name: 'check-completion',
      defaultMessageTimeToLive: twentyThreeHours,
      maxSizeInMegabytes: {}.hasOwnProperty.call(process.env, 'SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_CHECK_COMPLETION') ? parseInt(process.env.SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_CHECK_COMPLETION, 10) : twentyGigabytes
    },
    {
      name: 'check-marking',
      maxSizeInMegabytes: {}.hasOwnProperty.call(process.env, 'SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_CHECK_MARKING') ? parseInt(process.env.SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_CHECK_MARKING, 10) : twentyGigabytes
    },
    {
      name: 'check-notification',
      maxSizeInMegabytes: {}.hasOwnProperty.call(process.env, 'SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_CHECK_NOTIFICATION') ? parseInt(process.env.SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_CHECK_NOTIFICATION, 10) : twentyGigabytes
    },
    {
      name: 'check-sync',
      maxSizeInMegabytes: {}.hasOwnProperty.call(process.env, 'SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_CHECK_SYNC') ? parseInt(process.env.SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_CHECK_SYNC, 10) : twentyGigabytes
    },
    {
      name: 'check-validation',
      maxSizeInMegabytes: {}.hasOwnProperty.call(process.env, 'SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_CHECK_VALIDATION') ? parseInt(process.env.SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_CHECK_VALIDATION, 10) : twentyGigabytes
    },
    {
      name: 'ps-report-schools',
      defaultMessageTimeToLive: sixDays,
      maxSizeInMegabytes: {}.hasOwnProperty.call(process.env, 'SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_PS_REPORT_SCHOOLS') ? parseInt(process.env.SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_PS_REPORT_SCHOOLS, 10) : fiveGigabytes
    },
    {
      name: 'ps-report-staging',
      defaultMessageTimeToLive: sixDays,
      maxSizeInMegabytes: {}.hasOwnProperty.call(process.env, 'SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_PS_REPORT_STAGING') ? parseInt(process.env.SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_PS_REPORT_STAGING, 10) : eightyGigabytes
    },
    {
      name: 'ps-report-export',
      defaultMessageTimeToLive: sixDays,
      maxSizeInMegabytes: {}.hasOwnProperty.call(process.env, 'SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_PS_REPORT_EXPORT') ? parseInt(process.env.SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_PS_REPORT_EXPORT, 10) : eightyGigabytes
    },
    {
      name: 'pupil-login',
      maxSizeInMegabytes: {}.hasOwnProperty.call(process.env, 'SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_PUPIL_LOGIN') ? parseInt(process.env.SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_PUPIL_LOGIN, 10) : twentyGigabytes
    },
    {
      name: 'queue-replay'
    },
    {
      name: 'school-results-cache'
    },
    {
      name: 'sync-results-to-db-complete',
      maxSizeInMegabytes: {}.hasOwnProperty.call(process.env, 'SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_SYNC_RESULTS_COMPLETE') ? parseInt(process.env.SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_SYNC_RESULTS_COMPLETE, 10) : twentyGigabytes
    },
    {
      name: 'ps-report-log',
      maxSizeInMegabytes: {}.hasOwnProperty.call(process.env, 'SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_PS_REPORT_LOG') ? parseInt(process.env.SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_PS_REPORT_LOG, 10) : twentyGigabytes
    },
    {
      name: 'ps-report-exec',
      maxSizeInMegabytes: {}.hasOwnProperty.call(process.env, 'SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_PS_REPORT_EXEC') ? parseInt(process.env.SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_PS_REPORT_EXEC, 10) : oneGigabyte,
      defaultMessageTimeToLive: sixHours,
      maxDeliveryCount: 1
    }
  ]
}

function mergeServiceBusQueueDefaultsWithSpecifics () {
  const queues = R.clone(config.Queues)
  const defaults = R.clone(config.QueueDefaults)
  return queues.map(q => {
    return R.mergeRight(defaults, q)
  })
}

const mergedConfig = mergeServiceBusQueueDefaultsWithSpecifics()

module.exports = mergedConfig
