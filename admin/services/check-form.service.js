'use strict'

const csv = require('fast-csv')
const moment = require('moment')
const checkFormDataService = require('../services/data-access/check-form.data.service')
const checkWindowService = require('../services/check-window.service')

const checkFormService = {
  /**
   * Allocate a check form. This method is only used in check-start.service.
   * TODO: business logic
   * @returns {Promise.<*>}
   */
  allocateCheckForm: async function () {
    // Until we determine the logic behind fetching the appropriate check form
    // the pupil will receive the first.
    // UPDATE: There is a PBI to ensure randomness. This work is pending.
    const checkForm = await checkFormDataService.getActiveFormPlain()
    if (!checkForm) {
      throw new Error('CheckForm not found')
    }
    return checkForm
  },

  /**
   * Extract the questions from the check-form, and add an `order` property.
   * @param checkForm
   */
  prepareQuestionData: function (checkForm) {
    const {questions} = checkForm
    return questions.map((q, i) => { return {order: ++i, factor1: q.f1, factor2: q.f2} })
  },

  /**
   * Populate a Mongoose model with data from a CSV file
   * @param {CheckForm} checkForm Mongoose model
   * @param {String} absCsvFile Absolute path to csv file: e.g /home/abc/csvfile.csv
   * @return {Promise}
   */
  populateFromFile: function (checkForm, absCsvFile) {
    if (!checkForm) {
      throw new Error('Check form arguments missing')
    }

    if (!absCsvFile) {
      throw new Error('CSV file arguments missing')
    }

    if (!checkForm.questions) {
      checkForm.questions = []
    }

    return new Promise(function (resolve, reject) {
      csv.fromPath(absCsvFile, { headers: false, trim: true })
        .validate((row) => {
          if (row[ 0 ] < 1 || row[ 0 ] > 12 || row[ 1 ] < 1 || row[ 1 ] > 12) {
            return false
          }
          if (row[ 0 ].match(/[^0-9]/) || row[ 1 ].match(/[^0-9]/)) {
            return false
          }
          // We expect 2, and only 2 columns
          return row.length === 2
        })
        .on('data', function (row) {
          let q = {}
          q.f1 = parseInt(row[ 0 ], 10)
          q.f2 = parseInt(row[ 1 ], 10)
          checkForm.questions.push(q)
        })
        .on('data-invalid', function (row) {
          reject(new Error(`Row is invalid: [${row[ 0 ]}] [${row[ 1 ]}]`))
        })
        .on('end', function () {
          resolve(checkForm)
        })
        .on('error', function (error) {
          reject(error)
        })
    })
  },

  /**
   * Return a view friendly list of check-forms and their linked windows.
   * @param sortField
   * @param sortDirection
   * @returns {Promise.<*>}
   */
  formatCheckFormsAndWindows: async (sortField, sortDirection) => {
    let formData
    formData = await checkFormDataService.fetchSortedActiveForms({}, sortField, sortDirection)
    if (formData.length > 0) {
      const checkWindows = await checkWindowService.getCheckWindowsAssignedToForms()

      formData.forEach(f => {
        f.removeLink = true
        if (checkWindows[f._id]) {
          f.checkWindows = checkWindows[f._id].map(cw => { return cw.checkWindowName })
          f.removeLink = moment(f.checkStartDate).isAfter(moment())
        } else {
          f.checkWindows = []
        }
      })
    }
    return formData
  },

  /**
   * Un-assign check forms from check windows.
   * @param CheckWindow
   * @param CheckWindowsByForm
   * @returns {Promise.<void>}
   */
  unassignedCheckFormsFromCheckWindows: async (CheckWindow, CheckWindowsByForm) => {
    if (CheckWindowsByForm[CheckWindow._id]) {
      // Array of CheckWindows models, each with a forms array
      let modifiedCheckWindows = []
      CheckWindowsByForm[CheckWindow._id].forEach(cw => {
        const index = cw.forms.indexOf(CheckWindow._id)
        if (index > -1) {
          cw.forms.splice(index, 1)
          modifiedCheckWindows.push(cw)
        }
      })
      // Update any changed check windows
      const promises = modifiedCheckWindows.map(cw => { cw.save() })
      return Promise.all(promises)
    }
  },
  /**
   * Append check windows name(s) and canDelete to check form object.
   * @param checkWindows
   * @returns {Promise.<void>}
   */
  checkWindowNames: (checkWindows) => {
    let checkWindowsName = []
    checkWindows.forEach(cw => {
      checkWindowsName.push(' ' + cw.checkWindowName)
    })
    return checkWindowsName
  },
  /**
   * Append check windows name(s) and canDelete to check form object.
   * @param checkWindows
   * @returns {Promise.<void>}
   */
  canDelete: (checkWindows) => {
    let canDelete
    checkWindows.forEach(cw => {
      if (cw.checkStartDate <= moment.utc()) {
        canDelete = false
      }
    })
    return canDelete
  }
}

module.exports = checkFormService
