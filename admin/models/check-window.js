'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CheckWindow = new Schema({
  checkWindowName: {
    type: String,
    required: true,
    trim: true
  },
  adminStartDate: {
    type: Date,
    required: true
  },
  checkStartDate: {
    type: Date,
    required: true
  },
  checkEndDate: {
    type: Date,
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false,
    required: true
  },
  forms: {
    type: [{
      type: Number,
      ref: 'CheckForm'
    }]
  }
}, {timestamps: true})

module.exports = mongoose.model('CheckWindow', CheckWindow)
