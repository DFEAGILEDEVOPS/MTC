'use strict'

const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const Schema = mongoose.Schema

const Pupil = new Schema({
  school: {
    type: Schema.Types.Number,
    required: true,
    ref: 'School'
  },
  upn: {
    type: String
  },
  foreName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 35
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 35
  },
  middleNames: {
    type: String,
    maxlength: 35,
    trim: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['M', 'F']
  },
  dob: {
    type: Date,
    required: true
  },
  pin: {
    type: String,
    maxlength: 5,
    trim: true
  },
  pinExpired: {
    type: Boolean,
    default: false
  },
  warmUpStartDate: {
    type: Date
  },
  warmUpEndDate: {
    type: Date
  },
  checkStartDate: {
    type: Date
  },
  checkEndDate: {
    type: Date
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Pupil', Pupil)
