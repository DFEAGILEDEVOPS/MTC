'use strict'

const mongoose = require('mongoose')
mongoose.Promise = global.Promise
// Add the UUID type
require('mongoose-uuid2')(mongoose)

const Schema = mongoose.Schema

const Check = new Schema({
  checkCode: {
    type: Schema.Types.UUID,
    required: true,
    // As of 2017-09 I don't think unique indexes are available in Cosmos DB, nevertheless this *ought* to be unique
    unique: true
  },
  pupilId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Pupil'
  },
  checkWindowId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'CheckWindow'
  },
  checkFormId: {
    type: Number,
    required: true,
    ref: 'CheckForm'
  },
  checkStartDate: {
    type: Date,
    required: true
  }
}, {timestamps: true})

module.exports = mongoose.model('Check', Check)
