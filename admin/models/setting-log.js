'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SettingLog = new Schema({
  adminSession: {
    type: String,
    ref: 'AdminSession',
    required: true
  },
  emailAddress: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  questionTimeLimit: {
    type: Number,
    required: true
  },
  loadingTimeLimit: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('SettingLog', SettingLog)
