'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const randomGenerator = require('../lib/random-generator')

const School = new Schema({
  _id: {type: Number},
  leaCode: {
    type: Number,
    required: true,
    trim: true,
    max: 999,
    min: 0
  },
  upn: {
    type: Number,
    trim: true,
    min: 0
  },
  estabCode: {
    type: String,
    required: true,
    trim: true,
    match: /^[0-9]{4}$/
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  schoolPin: {
    type: String,
    trim: true
  },
  hdf: {
    _id: false,
    signedDate: {type: Date},
    declaration: {type: String},
    fullName: {type: String},
    jobTitle: {type: String}
  }
}, {
  timestamps: true
})

School.pre('validate', function (next) {
  this._id = parseInt('' + this.leaCode + this.estabCode, 10)
  next()
})

function getRandomSchoolPin () {
  const length = 8
  const chars = '23456789bcdfghjkmnpqrstvwxyz'
  return randomGenerator.getRandom(length, chars)
}

/**
 * This is required because Azure Cosmos DB does not have unique index capability
 * @return {Promise}
 */
School.statics.getUniqueSchoolPin = function () {
  return new Promise(async (resolve, reject) => {
    try {
      for (let i = 0; i < 100; i++) {
        const pin = getRandomSchoolPin()
        // check it against the db to ensure it is unique
        const school = await this.findOne({schoolPin: pin}).exec()
        if (!school) {
          return resolve(pin)
        }
      }
      reject(new Error('Failed to find a unique school pin'))
    } catch (error) {
      reject(error)
    }
  })
}

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
