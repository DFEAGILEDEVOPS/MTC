'use strict'

const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const Schema = mongoose.Schema
const R = require('ramda')

const checkOptionsSchema = new Schema({
  _id: false,
  speechSynthesis: {
    type: Boolean,
    required: true,
    default: false
  }
})

const defaultCheckOptions = {
  speechSynthesis: false
}

const Pupil = new Schema({
  school: {
    type: Number,
    required: true,
    ref: 'School'
  },
  upn: {
    type: String,
    required: true,
    maxlength: 13
  },
  foreName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 128
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 128
  },
  middleNames: {
    type: String,
    maxlength: 128,
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
    maxlength: 4,
    trim: true
  },
  pinExpiresAt: {
    type: Date,
    trim: true
  },
  hasAttended: {
    type: Boolean,
    default: false
  },
  jwtSecret: {
    type: String
  },
  attendanceCode: {
    type: Object,
    required: false,
    ref: 'AttendanceCode'
  },
  isTestAccount: {
    type: Boolean,
    default: false
  },
  checkOptions: {
    type: checkOptionsSchema,
    required: false,
    default: defaultCheckOptions
  }
}, {
  timestamps: true
})

/**
 * Validation / sanitisation
 */
Pupil.pre('validate', function (next) {
  // Silently truncate the names to 128 chars
  for (let prop of ['foreName', 'middleNames', 'lastName']) {
    if (this[prop] && this[prop].length > 128) {
      this[prop] = this[prop].substring(0, 128)
    }
  }

  // If checkOptions is missing, add it in here on validate
  if (R.path(['checkOptions', 'speechSynthesis'], this) === undefined) {
    this.checkOptions = defaultCheckOptions
  }
  next()
})

module.exports = mongoose.model('Pupil', Pupil)
