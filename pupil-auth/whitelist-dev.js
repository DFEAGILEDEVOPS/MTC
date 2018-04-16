/**
 * Optional environment variables
 */

const whitelist = [
  'AZURE_STORAGE_CONNECTION_STRING',
  'GOOGLE_TRACKING_ID',
  'MTC_AUTH_PRIVATE_KEY',
  'NCA_TOOLS_AUTH_URL',
  'PUPIL_APP_URL',
  'RESTART_MAX_ATTEMPTS',
  'TSO_AUTH_PUBLIC_KEY',
  'OverridePinExpiry'
]

module.exports = process.env.NODE_ENV !== 'production' ? whitelist : []
