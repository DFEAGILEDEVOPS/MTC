'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const School = new Schema({
  _id: {type: Number},
  leaCode: {
    type: Schema.Types.Number,
    required: true,
    trim: true,
    max: 999,
    min: 0
  },
  estabCode: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  schoolPin: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
})

/**
 * Retrieve school record from PIN.
 * @return {Promise}
 */
School.statics.getSchoolFromPin = function (schoolPin) {
  if (schoolPin < 1) {
    throw new Error('Missing pupil id')
  }
  let school
  try {
    school = this.find({schoolPin: schoolPin})
  } catch (error) {
    console.log('getSchoolFromPin ERROR', error)
  }
  return school
}

module.exports = mongoose.model('School', School)
