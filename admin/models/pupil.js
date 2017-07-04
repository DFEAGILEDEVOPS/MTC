'use strict'

const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const Schema = mongoose.Schema

const Pupil = new Schema({
  school: {
    type: Number,
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
  hasAttended: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

/**
 * Retrieve pupil records by school code
 * @return {Promise}
 */
Pupil.statics.getPupils = function (schoolCode) {
  if (schoolCode < 1) {
    throw new Error('Missing school code')
  }
  const pupils = this.find({ school: schoolCode }).sort({ createdAt: 1 }) || null
  if (!pupils) {
    console.log('getPupils ERROR', error)
  }
  return pupils
}

module.exports = mongoose.model('Pupil', Pupil)
