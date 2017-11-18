'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const autoIncrement = require('mongoose-auto-increment')

mongoose.Promise = global.Promise
const PREFIX = 'MTC'

/**
 * NB: name will be overwritten
 */
const CheckForm = new Schema({
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

// Make the `id` an incrementing number
CheckForm.plugin(autoIncrement.plugin, { model: 'CheckForm', startAt: 1 })

CheckForm.pre('save', function (next) {
  if (!this._id) {
    throw new Error('Missing _id field')
  }
  let paddedId = pad(4, this._id)
  this.name = PREFIX + paddedId
  next()
})

module.exports = mongoose.model('CheckForm', CheckForm)

function pad (paddingLen, id) {
  let padding = '0'.repeat(paddingLen - 1)
  return ('' + padding + id).slice(-1 * Math.max(paddingLen, id.toString().length))
}
