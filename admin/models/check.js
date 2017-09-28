'use strict'

const mongoose = require('mongoose')
mongoose.Promise = global.Promise
// Add the UUID type
require('mongoose-uuid2')(mongoose)

const Schema = mongoose.Schema

const Check = new Schema({
  checkCode: {
    type: String,
    required: true,
    // As of 2017-09 I don't think unique indexes are available in Cosmos DB, nevertheless this *ought* to be unique
    unique: true,
    validate: {
      validator: (v) => { return /^[0-9a-fA-F]{8}-?[0-9a-fA-F]{4}-?4[0-9a-fA-F]{3}-?[89abAB][0-9a-fA-F]{3}-?[0-9a-fA-F]{12}$/.test(v) },
      message: 'checkCode {VALUE} is not a valid GUID'
    }
  },
  pupilId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Pupil'
  },
  checkWindowId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'CheckWindow'
  },
  checkFormId: {
    type: Number,
    required: true,
    ref: 'CheckForm'
  },
  checkStartDate: {
    type: Date,
    required: true
  }
}, {timestamps: true})

module.exports = mongoose.model('Check', Check)
