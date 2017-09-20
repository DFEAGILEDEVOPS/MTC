const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const Schema = mongoose.Schema

const AttendanceCodes = new Schema({
  reason: {
    type: String,
    required: true
  },
  code: {
    type: Number,
    required: true
  }
}, {timestamps: true})

module.exports = mongoose.model('AttendanceCodes', AttendanceCodes)
