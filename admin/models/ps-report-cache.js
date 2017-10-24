'use strict'

const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const Schema = mongoose.Schema

const PsReportCache = new Schema({
  checkId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Check'
  },
  data: {
    type: Object,
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('PsReportCache', PsReportCache)
