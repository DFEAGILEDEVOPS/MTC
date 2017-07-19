let MongoClient = require('mongodb').MongoClient
const url = 'mongodb://127.0.0.1:27017/mtc' // will need to be changed to ENV variable for other connections

module.exports = {
  Settings: function () {
    return MongoClient.connect(url).then(function (db) {
      var collection = db.collection('settings')

      return collection.find().toArray()
    }).then(function (items) {
      return items
    })
  },
  SettingsLogs: function () {
    return MongoClient.connect(url).then(function (db) {
      var collection = db.collection('settinglogss')

      return collection.find().sort({datefield: 1}).toArray()
    }).then(function (items) {
      return items
    })
  }
}
