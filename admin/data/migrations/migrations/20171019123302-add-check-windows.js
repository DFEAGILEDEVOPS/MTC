'use strict'

const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const config = require('../config')
const CheckWindow = require('../../../models/check-window')

module.exports = {
  up (db, next) {
    mongoose.connect(config.mongodb.url, async error => {
      if (error) {
        next(new Error('Could not connect to mongodb: ' + error.message))
      }

      const ch = []

      ch.push({
        checkWindowName: 'Check Window Test A',
        checkStartDate: '2017-09-10 12:00:00',
        checkEndDate: '2017-09-20 12:00:00',
        adminStartDate: '2017-09-09 11:33:00',
        isDeleted: false
      })

      ch.push({
        checkWindowName: 'Check Window Test B',
        checkStartDate: '2017-10-22 12:00:00',
        checkEndDate: '2017-10-28 12:00:00',
        adminStartDate: '2017-10-19 11:44:00',
        isDeleted: false
      })

      ch.push({
        checkWindowName: 'Check Window Test C',
        checkStartDate: '2017-10-18 12:00:00',
        checkEndDate: '2017-10-21 12:00:00',
        adminStartDate: '2017-10-15 11:22:00',
        isDeleted: false
      })

      try {
        await CheckWindow.insertMany(ch)
        mongoose.disconnect(() => next())
      } catch (error) {
        console.log('ERROR', error)
        next(error)
      }
    })
  }
}
