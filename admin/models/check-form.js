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
      f1: {type: Number, min: 1, max: 12, required: true},
      f2: {type: Number, min: 1, max: 12, required: true}
    }],
    default: undefined,
    required: true
  },
  isDeleted: {type: Boolean, default: false}
}, {timestamps: true})

// Make the `id` an incrementing number
CheckForm.plugin(autoIncrement.plugin, {model: 'CheckForm', startAt: 1})

CheckForm.pre('save', function (next) {
  if (!this._id) {
    throw new Error('Missing _id field')
  }
  let paddedId = pad(4, this._id)
  this.name = PREFIX + paddedId
  next()
})

// The policy is to not deleted anything from the Datastore, so we soft delete them instead.  We can only mark it
// as deleted if it is not assigned to a check window, or if the check window has not yet started.
CheckForm.methods.markAsDeleted = function (CheckWindow) {
  return new Promise(async (resolve, reject) => {
    if (!CheckWindow || typeof CheckWindow !== 'function') {
      return reject(new TypeError('CheckWindow is a required arg'))
    }

    if (!this.id) {
      return reject(new Error('This form does not have an id'))
    }

    try {
      // Only mark as deleted if there is no check window assigned, or the check window
      // has not yet started.
      const checkWindows = await CheckWindow.getCheckWindowsAssignedToForms()
      if (checkWindows[this.id]) {
        let now = new Date()
        checkWindows[this.id].forEach(cw => {
          if (cw.startDate <= now) {
            return reject(new Error(`Unable to delete checkform ${this.id} as it is assigned to CheckWindow ${cw.name} which has a start date in the past`))
          }
        })
      }
    } catch (error) {
      return reject(error)
    }

    this.isDeleted = true

    try {
      await this.save()
    } catch (error) {
      return reject(error)
    }

    resolve(this)
  })
}

CheckForm.statics.getActiveForms = function (q) {
  if (!q) {
    q = {}
  }
  q.isDeleted = false
  return this.find(q)
}

CheckForm.statics.getActiveForm = function (id) {
  return this.findOne({_id: id, isDeleted: false})
}

module.exports = mongoose.model('CheckForm', CheckForm)

function pad (paddingLen, id) {
  let padding = '0'.repeat(paddingLen - 1)
  return ('' + padding + id).slice(-1 * Math.max(paddingLen, id.toString().length))
}
