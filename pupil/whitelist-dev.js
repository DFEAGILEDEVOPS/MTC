/**
 * Optional environment variables
 */

const whitelist = [
  'GOOGLE_TRACKING_ID',
  'MTC_SERVICE',
  'NEW_RELIC_LICENSE_KEY',
  'STD_LOG_FILE'
]

module.exports = process.env.NODE_ENV !== 'production' ? whitelist : []
