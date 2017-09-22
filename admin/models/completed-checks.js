'use strict'

const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const Schema = mongoose.Schema

const CompletedChecks = new Schema({
  data: {
    type: Object,
    required: true
  },
  receivedByServerAt: {
    type: Date,
    required: true
  }
})

module.exports = mongoose.model('completedChecks', CompletedChecks)
