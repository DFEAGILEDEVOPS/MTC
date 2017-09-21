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
  }
}, {timestamps: true})

AttendanceCode.statics.getAttendanceCodes = function () {
  let attendanceCodes
  try {
    attendanceCodes = this.find()
  } catch (error) {
    console.log('ERROR getting attendance codes', error)
  }
  return attendanceCodes
}

module.exports = mongoose.model('AttendanceCode', AttendanceCode)
