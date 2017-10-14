'use strict'

// data providers
const mongoService = require('./mongo.service')
const mongoose = require('mongoose')
const azureService = require('./azure-storage.service')
const config = require('../../config')

// data service initialisation
function initMongoose () {
  mongoose.promise = global.Promise
  const connectionString = config.MONGO_CONNECTION_STRING
  mongoose.connect(connectionString, function (err) {
    if (err) {
      throw new Error('Could not connect to mongodb: ' + err.message)
    }
  })
}

function initTableStorage () {
  azureService.init()
}

function initMongoOfficial () {
  mongoService.connect()
}

module.exports.init = () => {
  console.log('  Storage Provider:', process.env.STORAGE_PROVIDER)
  switch (config.StorageProvider) {
    case 'TableStorage':
      initTableStorage()
      break
    case 'MongoOfficial':
      initMongoOfficial()
      break
    case 'Mongoose':
      initMongoose()
      break
    default:
      initTableStorage()
  }
}
