'use strict'

const completedCheckDataService = {}

/**
 * Create a new Check
 * @param data
 * @return {Promise}
 */
completedCheckDataService.create = async function (data) {
  const completedCheck = new CompletedCheck(data)
  await completedCheck.save()
  return completedCheck
}

// model
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const Schema = mongoose.Schema

const CompletedCheck = new Schema({
  data: {
    type: Object,
    required: true
  },
  receivedByServerAt: {
    type: Date,
    required: true
  }
})

module.exports = completedCheckDataService
