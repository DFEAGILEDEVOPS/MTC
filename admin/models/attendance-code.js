const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const Schema = mongoose.Schema

const AttendanceCode = new Schema({
  reason: {
    type: String,
    required: true
  },
  code: {
    type: Number,
    required: true
  },
  order: {
    type: Number
  }
}, {timestamps: true})

module.exports = mongoose.model('AttendanceCode', AttendanceCode)
