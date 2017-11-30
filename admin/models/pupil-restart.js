'use strict'

const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const Schema = mongoose.Schema

const PupilRestart = new Schema({
  pupilId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Pupil'
  },
  recordedByUser: {
    type: String
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
    type: String
  },
  deletedAt: {
    type: Date
  }
}, {timestamps: true})

module.exports = mongoose.model('PupilRestart', PupilRestart)
