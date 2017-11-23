'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

mongoose.Promise = global.Promise
const PREFIX = 'MTC'

/**
 * NB: name will be overwritten
 */
const CheckForm = new Schema({
  _id: Number,
  name: {type: String},
  questions: {
    type: [{
      _id: false,
      f1: {
        type: Number,
        min: 1,
        max: 12,
        required: true
      },
      f2: {
        type: Number,
        min: 1,
        max: 12,
        required: true
      }
    }],
    default: undefined,
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {timestamps: true})

CheckForm.pre('save', async function (next) {
  if (!this._id) {
    // @TODO: Auto-increment will have a better solution once we move to SQL.
    const latestDocument = await this.constructor.findOne({}).sort({ '_id': 'desc' }).exec()
    const latestId = latestDocument._id || 0
    this._id = parseInt(latestId) + 1
  }
  let id = this._id.toString()
  this.name = PREFIX + id.padStart(4, '0')
  next()
})

module.exports = mongoose.model('CheckForm', CheckForm)
