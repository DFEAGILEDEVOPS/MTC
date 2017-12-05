'use strict'

const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const config = require('../config')
const RestartCode = require('../../../models/restart-code')

module.exports = {
  up (db, next) {
    mongoose.connect(config.mongodb.url, async error => {
      if (error) {
        next(new Error('Could not connect to mongodb: ' + error.message))
      }

      try {
        await createRestartCode('Remove restart', 1)
        await createRestartCode('Restart taken', 2)
        await createRestartCode('Maximum number of restarts taken', 3)
        mongoose.disconnect(() => next())
      } catch (error) {
        console.log('ERROR', error)
        next(error)
      }
    })
  },

  down (db, next) {
    db.collection('restartcodes').drop()
    next()
  }
}

function createRestartCode (status, code) {
  return new Promise(async function (resolve, reject) {
    let restartCode = new RestartCode({
      status: status,
      code: code
    })

    try {
      restartCode = await restartCode.save()
      resolve(restartCode)
    } catch (error) {
      reject(error)
    }
  })
}
