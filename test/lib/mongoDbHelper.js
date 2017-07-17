let MongoClient = require('mongodb').MongoClient
let myCollection

class MongoDbHelper {
  static createConnectionSchools (onCreate) {
    MongoClient.connect('mongodb://127.0.0.1:27017/mtc', function (err, db) {
      if (err) {
        throw err
      }
      console.log('connected to the mongoDB !')
      myCollection = db.collection('schools')
      onCreate()
    })
  }

  static findSchool (schoolId) {
    this.createConnectionSchools(function () {
      var cursor = myCollection.find({'_id': schoolId})
      cursor.each(function (err, doc) {
        if (err) {
          throw err
        }
        if (doc == null) { return }
        console.log('document find:')
        console.log(doc.name)
      })
    })
  }

  static createConnectionPupils (onCreate) {
    MongoClient.connect('mongodb://127.0.0.1:27017/mtc', function (err, db) {
      if (err) {
        throw err
      }
      console.log('connected to the mongoDB !')
      myCollection = db.collection('pupils')
      onCreate()
    })
  }

  static expirePin (forName, lastName, schoolId, flag = true) {
    this.createConnectionPupils(function () {
      myCollection.updateOne({
        'foreName': forName,
        'lastName': lastName,
        'school': schoolId
      }, {$set: {'pinExpired': flag}}, function (err) {
        if (err) {
          throw err
        }
        console.log('entry update')
      })
    })
  }
  static resetPin (forName, lastName, schoolId, pin = undefined) {
    this.createConnectionPupils(function () {
      myCollection.updateOne({
        'foreName': forName,
        'lastName': lastName,
        'school': schoolId
      }, {$set: {'pin': pin}}, function (err) {
        if (err) {
          throw err
        }
        console.log('entry update')
      })
    })
  }
}

module.exports = MongoDbHelper
