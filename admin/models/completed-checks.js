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
  },
  isMarked: {
    type: Boolean
  },
  markedAt: {
    type: Date
  }
}, {timestamps: true})

module.exports = mongoose.model('completedChecks', CompletedChecks)
