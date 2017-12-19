const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const Schema = mongoose.Schema

const PupilStatusCode = new Schema({
  statusDesc: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  }
}, {timestamps: true})

module.exports = mongoose.model('PupilStatusCode', PupilStatusCode)
