'use strict'

const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const Schema = mongoose.Schema

const Check = new Schema({
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
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'CheckForm'
  },
  checkStartDate: {
    type: Date,
    required: true
  }
}, {timestamps: true})

module.exports = mongoose.model('Check', Check)
