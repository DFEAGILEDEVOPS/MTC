/**
 * Optional environment variables
 */

const whitelist = [
  'AZURE_STORAGE_CONNECTION_STRING',
  'AZURE_STORAGE_LOGGING_ENABLED',
  'GOOGLE_TRACKING_ID',
  'MTC_AUTH_PRIVATE_KEY',
  'MTC_SERVICE',
  'NCA_TOOLS_AUTH_URL',
  'NEW_RELIC_LICENSE_KEY',
  'PUPIL_APP_URL',
  'RESTART_MAX_ATTEMPTS',
  'TSO_AUTH_PUBLIC_KEY',
  'OverridePinExpiry'
]

module.exports = process.env.NODE_ENV !== 'production' ? whitelist : []
