'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Setting = new Schema({
  questionTimeLimit: {
    type: Number,
    required: true,
    trim: true,
    max: 60, // Suggested value. Confirm
    min: 1
  },
  loadingTimeLimit: {
    type: Number,
    required: true,
    trim: true,
    max: 5, // Suggested value. Confirm
    min: 1
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Setting', Setting)
