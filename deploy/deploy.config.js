'use strict'

// for reference...
const oneGigabyte = 1024
const fiveGigabytes = 5120
const fourtyGigabytes = 40960
const eightyGigabytes = 81920
const fourteenDays = 'P14D'
const oneHundredAndTwentyDays = 'P120D'
const fiveMinutes = 'PT5M'
const oneDay = 'P1D'
const sixDays = 'P6D'

module.exports = {
  ServiceBus: {
    QueueDefaults: {
      maxSizeInMegabytes: {}.hasOwnProperty.call(process.env, 'SERVICE_BUS_QUEUE_MAX_SIZE_DEFAULT') ? parseInt(process.env.SERVICE_BUS_QUEUE_MAX_SIZE_DEFAULT, 10) : fiveGigabytes,
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
        defaultMessageTimeToLive: sixDays,
        maxSizeInMegabytes: {}.hasOwnProperty.call(process.env, 'SERVICE_BUS_QUEUE_MAX_SIZE_PS_REPORT_SCHOOLS') ? parseInt(process.env.SERVICE_BUS_QUEUE_MAX_SIZE_PS_REPORT_SCHOOLS, 10) : fiveGigabytes
      },
      {
        name: 'ps-report-staging',
        defaultMessageTimeToLive: sixDays,
        maxSizeInMegabytes: {}.hasOwnProperty.call(process.env, 'SERVICE_BUS_QUEUE_MAX_SIZE_PS_REPORT_STAGING') ? parseInt(process.env.SERVICE_BUS_QUEUE_MAX_SIZE_PS_REPORT_STAGING, 10) : eightyGigabytes
      },
      {
        name: 'ps-report-export',
        defaultMessageTimeToLive: sixDays,
        maxSizeInMegabytes: {}.hasOwnProperty.call(process.env, 'SERVICE_BUS_QUEUE_MAX_SIZE_PS_REPORT_EXPORT') ? parseInt(process.env.SERVICE_BUS_QUEUE_MAX_SIZE_PS_REPORT_EXPORT, 10) : eightyGigabytes
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
