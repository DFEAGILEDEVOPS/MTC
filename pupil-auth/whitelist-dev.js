/**
 * Optional environment variables
 */

const whitelist = [
  'AZURE_STORAGE_CONNECTION_STRING'
]

module.exports = process.env.NODE_ENV !== 'production' ? whitelist : []
