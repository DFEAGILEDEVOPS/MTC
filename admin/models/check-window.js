'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CheckWindow = new Schema({
  checkWindowName: {
    type: String,
    required: true,
    trim: true
  },
  adminStartDate: {
    type: Date,
    required: true
  },
  checkStartDate: {
    type: Date,
    required: true
  },
  checkEndDate: {
    type: Date,
    required: true
  },
  forms: {
    type: [{
      type: Number,
      ref: 'CheckForm'
    }]
  }
}, {timestamps: true})

/**
 * Retrieve all check windows and sort by arguments passed.
 * @param sortBy
 * @param direction
 * @returns {Promise}
 */
CheckWindow.statics.getCheckWindows = function (sortBy, direction) {
  return new Promise(async (resolve, reject) => {
    let checkWindows
    const sort = {}
    sort[sortBy] = direction

    try {
      checkWindows = await this.find({}).sort(sort).exec()
    } catch (error) {
      reject(error)
    }
    resolve(checkWindows)
  })
}

CheckWindow.statics.getCheckWindow = function (checkWindowId) {
  return new Promise(async (resolve, reject) => {
    let checkWindow
    try {
      checkWindow = await this.findOne({'_id': checkWindowId}).exec()
    } catch (error) {
      reject(error)
    }
    resolve(checkWindow)
  })
}

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
