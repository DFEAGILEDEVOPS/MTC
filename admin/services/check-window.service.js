'use strict'
const moment = require('moment')
const CheckWindow = require('../models/check-window')
const checkWindowDataService = require('../services/data-access/check-window.data.service')
const dateService = require('../services/date.service')

const checkWindowService = {
  /**
   * Format check windows document, prepare to parse in view.
   * @param checkWindows
   * @param isCurrent
   * @param canRemove
   */
  formatCheckWindowDocuments: (checkWindows, isCurrent, canRemove) => {
    return checkWindows.map(cw => {
      const adminStartDateMo = moment(cw.adminStartDate)
      const checkStartDateMo = moment(cw.checkStartDate)
      const checkEndDateMo = moment(cw.checkEndDate)

      return {
        id: cw._id,
        checkWindowName: cw.checkWindowName,
        adminStartDate: adminStartDateMo.format('D MMM YYYY'),
        checkDates: dateService.formatCheckPeriod(checkStartDateMo, checkEndDateMo),
        canRemove: typeof canRemove === 'boolean' ? canRemove : (Date.parse(cw.checkStartDate) >= Date.now()),
        isCurrent: isCurrent
      }
    })
  },
  /**
   * Retrieve all (active) CheckWindows and return the list
   * indexed by form.id, so we can easily list the check windows
   *  each form is assigned to.
   * @return {Promise}
   */
  getCheckWindowsAssignedToForms: () => {
    return new Promise(async (resolve, reject) => {
      let checkWindows
      let data = {}

      try {
        checkWindows = await checkWindowDataService.fetchCheckWindows()
      } catch (error) {
        reject(error)
      }

      // Create a data structure:
      // { 101: [
      //    { checkwindow model }, ...
      //   ]
      // }
      if (checkWindows) {
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
      }
      resolve(data)
    })
  },
  /**
   * Soft delete check window.
   */
  markAsDeleted: (thisCheckWindow) => {
    return new Promise(async (resolve, reject) => {
      if (!thisCheckWindow || !thisCheckWindow._id) {
        return reject(new Error('This form does not have an id'))
      }

      try {
        // Only mark as deleted if:
        // 1. there is no check window assigned or
        // 2. the check window has not yet started.
        const checkWindows = await checkWindowService.getCheckWindowsAssignedToForms()
        if (checkWindows[thisCheckWindow._id]) {
          let now = new Date()
          checkWindows[thisCheckWindow._id].forEach(cw => {
            if (cw.startDate <= now) {
              return reject(new Error(`Unable to delete check-form ${cw._id} as it is assigned to CheckWindow ${cw.name} which has a start date in the past`))
            }
          })
        }
      } catch (error) {
        return reject(error)
      }

      thisCheckWindow.isDeleted = true
      try {
        await thisCheckWindow.save()
      } catch (error) {
        return reject(error)
      }

      resolve(CheckWindow)
    })
  }
}

module.exports = checkWindowService
