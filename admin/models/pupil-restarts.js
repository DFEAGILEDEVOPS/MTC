'use strict'

const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const Schema = mongoose.Schema

const pupilRestarts = new Schema({
  pupilId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Pupil'
  },
  recordedByUser: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reason: {
    type: String
  },
  didNotCompleteInformation: {
    type: String
  },
  furtherInformation: {
    type: String
  },
  createdAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false,
    required: true
  },
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  deletedAt: {
    type: Date
  }
}, {timestamps: true})

module.exports = mongoose.model('pupilRestarts', pupilRestarts)
