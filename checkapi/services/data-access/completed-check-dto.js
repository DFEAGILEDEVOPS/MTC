// model
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const Schema = mongoose.Schema

const CheckSchema = new Schema({
  data: {
    type: Object,
    required: true
  },
  receivedByServerAt: {
    type: Date,
    required: true
  }
})

const CompletedCheck = mongoose.model('CompletedCheck', CheckSchema)

module.exports = CompletedCheck
