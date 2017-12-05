const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const Schema = mongoose.Schema

const RestartCode = new Schema({
  status: {
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

module.exports = mongoose.model('RestartCode', RestartCode)
