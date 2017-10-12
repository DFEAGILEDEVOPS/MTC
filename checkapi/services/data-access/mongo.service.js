// official mongo driver
var MongoClient = require('mongodb').MongoClient
const config = require('../../config')

let connection = null

module.exports.connect = (option) => new Promise((resolve, reject) => {
  MongoClient.connect(config.MONGO_CONNECTION_STRING, option, function (err, db) {
    if (err) {
      console.log('error connecting to MongoDB: ', err.message)
      reject(err)
    }
    resolve(db)
    connection = db
  })
})

module.exports.get = () => {
  if (!connection) {
    throw new Error('Connection not open')
  }
  return connection
}
