module.exports = {
  AZURE_STORAGE_CONNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING,
  GOOGLE_SVC_EMAIL: process.env.GOOGLE_SVC_EMAIL,
  GOOGLE_SVC_PK: process.env.GOOGLE_SVC_PK,
  GOOGLE_TRACKING_ID: process.env.GOOGLE_TRACKING_ID,
  GOOGLE_SVC_DOC_KEY: process.env.GOOGLE_SVC_DOC_KEY,
  MTC_SERVICE: process.env.MTC_SERVICE,
  MONGO_CONNECTION_STRING: process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost/mtc',
  NEW_RELIC_LICENSE_KEY: process.env.NEW_RELIC_LICENSE_KEY,
  PORT: process.env.PORT || '3000',
  SESSION_SECRET: process.env.NODE_ENV === 'production' ? process.env.SESSION_SECRET : 'anti tamper for dev',
  STD_LOG_FILE: process.env.STD_LOG_FILE
}
