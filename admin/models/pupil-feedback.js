'use strict'

const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const Schema = mongoose.Schema

const pupilFeedback = new Schema({
  inputType: {
    type: String,
    required: true
  },
  satisfactionRating: {
    type: String,
    required: true
  },
  comments: {
    type: String
  },
  sessionId: {
    type: String
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('pupilFeedback', pupilFeedback)
