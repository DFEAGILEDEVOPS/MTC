'use strict'

const moment = require('moment')
const checkWindowDataService = require('./data-access/check-window.data.service')
const dateService = require('../services/date.service')
const checkFormDataService = require('./data-access/check-form.data.service')

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
        id: cw.id,
        checkWindowName: cw.name,
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
  getCheckWindowsAssignedToForms: async () => {
    return new Promise(async (resolve, reject) => {
      let checkWindows
      let data = {}

      try {
        checkWindows = await checkWindowDataService.sqlFetchCurrentCheckWindows('', '')
      } catch (error) {
        reject(error)
      }

      // Create a data structure:
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
            if (cw1.checkStartDate === cw2.checkStartDate) { return 0 }
            return cw1.checkStartDate < cw2.checkStartDate ? -1 : 1
          })
        })
      }
      resolve(data)
    })
  },

  /**
   * Soft delete check window.
   * @param checkForm
   * @returns {Promise<void>}
   */
  markAsDeleted: async (checkForm) => {
    return new Promise(async (resolve, reject) => {
      if (!checkForm || !checkForm.id) {
        return reject(new Error('This form does not have an id'))
      }

      try {
        // Only mark as deleted if:
        // 1. there is no check window assigned or
        // 2. the check window has not yet started.
        const checkWindows = await checkWindowService.getCheckWindowsAssignedToForms()
        if (checkWindows[checkForm.id]) {
          let now = new Date()
          checkWindows[checkForm.id].forEach(cw => {
            if (cw.checkStartDate <= now) {
              return reject(new Error(`Unable to delete check-form ${cw.id} as it is assigned to CheckWindow ${cw.name} which has a start date in the past`))
            }
          })
        }
      } catch (error) {
        return reject(error)
      }
      return checkFormDataService.sqlDeleteForm(checkForm.id)
    })
  },

  /**
   * Get current check windows and count forms assigned.
   * @returns {Promise<*|null>}
   */
  getCurrentCheckWindowsAndCountForms: async () => {
    let checkWindowsList = null
    let checkWindowsListData = await checkWindowDataService.sqlFetchCurrentCheckWindows('', '')
    if (checkWindowsListData) {
      checkWindowsList = checkWindowsListData.map((cw) => {
        return {
          'id': cw.id,
          'checkWindowName': cw.name,
          'totalForms': cw.FormCount
        }
      })
    }
    return checkWindowsList
  },

  /**
   * Merge existing (db saved) and new (passed via form) check form ids.
   * @param existingForms
   * @param newForms
   * @returns {Array}
   */
  mergedFormIds: (existingForms, newForms) => {
    let resultArray = []
    existingForms.map((f) => {
      resultArray.push(f)
    })
    newForms.map((f) => {
      resultArray.push(parseInt(f))
    })
    return resultArray
  }
}

module.exports = checkWindowService
