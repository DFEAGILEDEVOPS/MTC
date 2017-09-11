'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CheckWindow = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  adminStartDate: {
    type: Date,
    required: true,
    validate: function (date) { return date >= Date.now }
  },
  checkStartDate: {
    type: Date,
    required: true,
    validate: function (date) { return date >= Date.now }
  },
  checkEndDate: {
    type: Date,
    required: true,
    validate: function (date) { return date > this.checkStartDate }
  },
  forms: {
    type: [{
      type: Number,
      ref: 'CheckForm',
      required: true
    }]
  }
}, {timestamps: true})

/**
 * Retrieve all (active) CheckWindows and return the list
 * indexed by form.id, so we can easily list the check windows
 *  each form is assigned to.
 * @return {Promise}
 */
CheckWindow.statics.getCheckWindowsAssignedToForms = function () {
  return new Promise(async (resolve, reject) => {
    let checkWindows
    let data = {}

    try {
      checkWindows = await this.find({}).exec()
    } catch (error) {
      reject(error)
    }

    // Create a data structure:
    // { 101: [
    //    { checkwindow model }, ...
    //   ]
    // }
    checkWindows.forEach(cw => {
      cw.forms.forEach(formId => {
        if (!data.hasOwnProperty(formId)) {
          data[formId] = []
        }
        data[formId].push(cw)
      })
    })

    // Ideally we want the check windows to be sorted in order of the check windows, so spring comes
    // before summer.
    Object.getOwnPropertyNames(data).forEach(d => {
      data[d].sort((cw1, cw2) => {
        if (cw1.startDate === cw2.startDate) { return 0 }
        return cw1.startDate < cw2.startDate ? -1 : 1
      })
    })

    resolve(data)
  })
}

module.exports = mongoose.model('CheckWindow', CheckWindow)
