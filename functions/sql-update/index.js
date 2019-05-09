'use strict'

const process = require('process')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

module.exports = async function (context, sqlUpdateMessage) {
  context.log('sql-update: message received', sqlUpdateMessage)
}
