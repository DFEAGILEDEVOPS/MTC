/**
 * Optional environment variables
 */

const whitelist = [
  'AZURE_STORAGE_CONNECTION_STRING',
  'OverridePinExpiry'
]

module.exports = process.env.NODE_ENV !== 'production' ? whitelist : []
